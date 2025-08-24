// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Treasury - Unified Fund Management
 * @notice Single source of truth for all Grove platform funds
 * @dev Handles deposits, withdrawals, voting-based releases, inheritance, and vault management
 */
contract Treasury is ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant GROVE_ROLE = keccak256("GROVE_ROLE");
    bytes32 public constant VOTING_ROLE = keccak256("VOTING_ROLE");
    bytes32 public constant INHERITANCE_ROLE = keccak256("INHERITANCE_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    struct UserVault {
        uint256 balance;
        uint256 lockedInCircles;
        uint256 totalContributed;
        uint256 lastActivity;
        bool autoTopUp;
    }

    struct CircleTreasury {
        uint256 totalBalance;
        uint256 targetAmount;
        uint256 contributionAmount;
        uint256 contributionInterval;
        address owner;
        bool votingEnabled;
        uint256 memberCount;
        mapping(address => uint256) memberContributions;
        mapping(address => uint256) lastContribution;
    }

    // State variables
    mapping(address => UserVault) public userVaults;
    mapping(uint256 => CircleTreasury) public circleTreasuries;
    mapping(address => uint256[]) public userCircles;
    
    // Penalty system
    mapping(address => uint256) public penaltyScore;
    mapping(address => uint256) public lastPenalty;
    uint256 public constant PENALTY_DECAY_TIME = 30 days;
    
    // Auto-payment system
    mapping(uint256 => mapping(address => uint256)) public nextPaymentDue;
    mapping(address => bool) public autoPaymentEnabled;

    // Events
    event VaultDeposit(address indexed user, uint256 amount);
    event VaultWithdrawal(address indexed user, uint256 amount);
    event CircleContribution(uint256 indexed circleId, address indexed user, uint256 amount);
    event AutoPaymentExecuted(uint256 indexed circleId, address indexed user, uint256 amount);
    event PenaltyApplied(address indexed user, uint256 amount, string reason);
    event EmergencyWithdrawal(uint256 indexed circleId, address indexed user, uint256 amount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
    }

    // ============ VAULT MANAGEMENT ============

    /**
     * @dev Deposit funds into user's vault
     */
    function depositToVault() external payable nonReentrant {
        require(msg.value > 0, "Must deposit some amount");
        
        userVaults[msg.sender].balance += msg.value;
        userVaults[msg.sender].lastActivity = block.timestamp;
        
        emit VaultDeposit(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw from user's vault (available balance only)
     */
    function withdrawFromVault(uint256 amount) external nonReentrant {
        UserVault storage vault = userVaults[msg.sender];
        uint256 availableBalance = vault.balance - vault.lockedInCircles;
        
        require(amount <= availableBalance, "Insufficient available balance");
        
        vault.balance -= amount;
        vault.lastActivity = block.timestamp;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit VaultWithdrawal(msg.sender, amount);
    }

    /**
     * @dev Get user's vault info
     */
    function getUserVault(address user) external view returns (
        uint256 totalBalance,
        uint256 availableBalance,
        uint256 lockedInCircles,
        uint256 totalContributed,
        uint256 lastActivity
    ) {
        UserVault memory vault = userVaults[user];
        return (
            vault.balance,
            vault.balance - vault.lockedInCircles,
            vault.lockedInCircles,
            vault.totalContributed,
            vault.lastActivity
        );
    }

    // ============ CIRCLE TREASURY MANAGEMENT ============

    /**
     * @dev Initialize circle treasury (Grove only)
     */
    function initializeCircle(
        uint256 circleId,
        address owner,
        uint256 targetAmount,
        uint256 contributionAmount,
        uint256 contributionInterval
    ) external onlyRole(GROVE_ROLE) {
        CircleTreasury storage treasury = circleTreasuries[circleId];
        treasury.owner = owner;
        treasury.targetAmount = targetAmount;
        treasury.contributionAmount = contributionAmount;
        treasury.contributionInterval = contributionInterval;
    }

    /**
     * @dev Contribute to circle from user's vault
     */
    function contributeToCircle(uint256 circleId, address user, uint256 amount) 
        external 
        onlyRole(GROVE_ROLE) 
        nonReentrant 
    {
        UserVault storage vault = userVaults[user];
        CircleTreasury storage treasury = circleTreasuries[circleId];
        
        require(vault.balance >= amount, "Insufficient vault balance");
        require(amount == treasury.contributionAmount || treasury.contributionAmount == 0, "Wrong contribution amount");
        
        // Transfer from vault to circle
        vault.balance -= amount;
        vault.lockedInCircles += amount;
        vault.totalContributed += amount;
        vault.lastActivity = block.timestamp;
        
        treasury.totalBalance += amount;
        treasury.memberContributions[user] += amount;
        treasury.lastContribution[user] = block.timestamp;
        
        // Schedule next payment if recurring
        if (treasury.contributionInterval > 0) {
            nextPaymentDue[circleId][user] = block.timestamp + treasury.contributionInterval;
        }
        
        emit CircleContribution(circleId, user, amount);
    }

    /**
     * @dev Auto-execute recurring payments
     */
    function executeAutoPayment(uint256 circleId, address user) external {
        require(autoPaymentEnabled[user], "Auto-payment not enabled");
        require(block.timestamp >= nextPaymentDue[circleId][user], "Payment not due");
        
        CircleTreasury storage treasury = circleTreasuries[circleId];
        uint256 amount = treasury.contributionAmount;
        
        UserVault storage vault = userVaults[user];
        
        if (vault.balance >= amount) {
            // Execute normal payment
            vault.balance -= amount;
            vault.lockedInCircles += amount;
            vault.totalContributed += amount;
            vault.lastActivity = block.timestamp;
            
            treasury.totalBalance += amount;
            treasury.memberContributions[user] += amount;
            treasury.lastContribution[user] = block.timestamp;
            
            nextPaymentDue[circleId][user] = block.timestamp + treasury.contributionInterval;
            
            emit AutoPaymentExecuted(circleId, user, amount);
        } else {
            // Apply penalty for missed payment
            _applyMissedPaymentPenalty(user, amount);
        }
    }

    // ============ PENALTY SYSTEM ============

    /**
     * @dev Apply penalty for missed payment
     */
    function _applyMissedPaymentPenalty(address user, uint256 missedAmount) internal {
        uint256 currentScore = _getCurrentPenaltyScore(user);
        uint256 penaltyRate;
        
        if (currentScore == 0) {
            penaltyRate = 5; // 5% for first miss
        } else if (currentScore == 1) {
            penaltyRate = 10; // 10% for second miss
        } else {
            penaltyRate = 15; // 15% for third+ miss
        }
        
        uint256 penaltyAmount = (missedAmount * penaltyRate) / 100;
        
        UserVault storage vault = userVaults[user];
        if (vault.balance >= penaltyAmount) {
            vault.balance -= penaltyAmount;
            // Penalty goes to contract (could be redistributed)
        }
        
        penaltyScore[user] = currentScore + 1;
        lastPenalty[user] = block.timestamp;
        
        emit PenaltyApplied(user, penaltyAmount, "Missed payment");
    }

    /**
     * @dev Get current penalty score (decays over time)
     */
    function _getCurrentPenaltyScore(address user) internal view returns (uint256) {
        if (lastPenalty[user] == 0) return 0;
        
        uint256 timeSinceLastPenalty = block.timestamp - lastPenalty[user];
        if (timeSinceLastPenalty >= PENALTY_DECAY_TIME) {
            return 0; // Score resets after 30 days
        }
        
        return penaltyScore[user];
    }

    // ============ VOTING-BASED WITHDRAWALS ============

    /**
     * @dev Execute voting-approved withdrawal
     */
    function executeVotingWithdrawal(
        uint256 circleId,
        address recipient,
        uint256 amount
    ) external onlyRole(VOTING_ROLE) nonReentrant {
        CircleTreasury storage treasury = circleTreasuries[circleId];
        require(treasury.totalBalance >= amount, "Insufficient circle balance");
        
        treasury.totalBalance -= amount;
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // ============ INHERITANCE SYSTEM ============

    /**
     * @dev Execute inheritance withdrawal
     */
    function executeInheritanceWithdrawal(
        uint256 circleId,
        address deceased,
        address beneficiary,
        uint256 amount
    ) external onlyRole(INHERITANCE_ROLE) nonReentrant {
        CircleTreasury storage treasury = circleTreasuries[circleId];
        require(treasury.memberContributions[deceased] >= amount, "Insufficient deceased contributions");
        require(treasury.totalBalance >= amount, "Insufficient circle balance");
        
        treasury.totalBalance -= amount;
        treasury.memberContributions[deceased] -= amount;
        
        // Also update user's locked amount
        userVaults[deceased].lockedInCircles -= amount;
        
        (bool success, ) = beneficiary.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // ============ EMERGENCY FUNCTIONS ============

    /**
     * @dev Emergency withdrawal (admin only)
     */
    function emergencyWithdraw(uint256 circleId, address user) 
        external 
        onlyRole(EMERGENCY_ROLE) 
        whenPaused 
    {
        CircleTreasury storage treasury = circleTreasuries[circleId];
        uint256 userContribution = treasury.memberContributions[user];
        
        require(userContribution > 0, "No contribution to withdraw");
        
        treasury.totalBalance -= userContribution;
        treasury.memberContributions[user] = 0;
        userVaults[user].lockedInCircles -= userContribution;
        
        (bool success, ) = user.call{value: userContribution}("");
        require(success, "Emergency transfer failed");
        
        emit EmergencyWithdrawal(circleId, user, userContribution);
    }

    /**
     * @dev Pause contract (emergency only)
     */
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract (emergency only)
     */
    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get circle treasury info
     */
    function getCircleTreasury(uint256 circleId) external view returns (
        uint256 totalBalance,
        uint256 targetAmount,
        uint256 contributionAmount,
        uint256 contributionInterval,
        address owner,
        bool votingEnabled,
        uint256 memberCount
    ) {
        CircleTreasury storage treasury = circleTreasuries[circleId];
        return (
            treasury.totalBalance,
            treasury.targetAmount,
            treasury.contributionAmount,
            treasury.contributionInterval,
            treasury.owner,
            treasury.votingEnabled,
            treasury.memberCount
        );
    }

    /**
     * @dev Get member's contribution to circle
     */
    function getMemberContribution(uint256 circleId, address member) 
        external 
        view 
        returns (uint256) 
    {
        return circleTreasuries[circleId].memberContributions[member];
    }

    /**
     * @dev Check if payment is due
     */
    function isPaymentDue(uint256 circleId, address user) external view returns (bool) {
        return block.timestamp >= nextPaymentDue[circleId][user];
    }

    /**
     * @dev Get user's penalty info
     */
    function getUserPenaltyInfo(address user) external view returns (
        uint256 currentScore,
        uint256 lastPenaltyTime
    ) {
        return (_getCurrentPenaltyScore(user), lastPenalty[user]);
    }
}
