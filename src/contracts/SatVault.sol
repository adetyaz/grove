// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SatVault - Bitcoin Circle Treasury Management
 * @notice Handles sats deposits, recurring payments, and withdrawal conditions
 * @dev Designed for Citrea ZK-Rollup on Bitcoin
 */
contract SatVault {
    // Grove contract address - authorized to manage circles
    address public grove;
    
    // Circle treasury structure
    struct Circle {
        address owner;
        uint256 contributionAmount;
        uint256 contributionInterval; 
        uint256 nextPaymentDue; 
        uint256 treasuryBalance; 
        uint256 targetGoal;
        bool isActive;
    }

    // Circle data
    mapping(uint256 => Circle) public circles;
    
    // Member contributions
    mapping(uint256 => mapping(address => uint256)) public contributions;
    mapping(uint256 => mapping(address => uint256)) public lastContributionTime;

    // Events
    event CircleConfigured(
        uint256 indexed circleId,
        uint256 amount,
        uint256 interval,
        uint256 goal
    );
    event Deposit(
        uint256 indexed circleId,
        address indexed member,
        uint256 amount
    );
    event Withdrawal(
        uint256 indexed circleId,
        address indexed receiver,
        uint256 amount
    );
    event RecurringPaymentProcessed(
        uint256 indexed circleId,
        address indexed member
    );

    // Errors
    error NotCircleOwner();
    error NotAuthorized();
    error CircleNotActive();
    error InsufficientBalance();
    error PaymentNotDue();

    // Modifiers
    modifier onlyGroveOrOwner(uint256 circleId) {
        Circle storage circle = circles[circleId];
        if (circle.owner != msg.sender && (grove != address(0) && msg.sender != grove)) {
            revert NotAuthorized();
        }
        _;
    }

    modifier onlyGrove() {
        if (grove == address(0) || msg.sender != grove) revert NotAuthorized();
        _;
    }

    modifier onlyAdmin() {
        // Only allow grove updates before grove is set, or from current grove
        if (grove != address(0) && msg.sender != grove) revert NotAuthorized();
        _;
    }

    /**
     * @dev Constructor - Grove address set separately
     */
    constructor() {
        grove = address(0);
    }

    /**
     * @dev Configure circle payment rules (Grove or owner only)
     */
    function configureCircle(
        uint256 circleId,
        uint256 amount,
        uint256 interval,
        uint256 goal
    ) external onlyGroveOrOwner(circleId) {
        Circle storage circle = circles[circleId];
        
        circle.contributionAmount = amount;
        circle.contributionInterval = interval;
        circle.targetGoal = goal;
        circle.isActive = true;
        
        emit CircleConfigured(circleId, amount, interval, goal);
    }

    /**
     * @dev Set the owner of a circle (Grove only)
     */
    function setOwner(uint256 circleId, address newOwner) external onlyGrove {
        require(grove != address(0), "Grove not set");
        circles[circleId].owner = newOwner;
    }

    /**
     * @dev Deactivate a circle (Grove or owner only)
     */
    function deactivateCircle(uint256 circleId) external onlyGroveOrOwner(circleId) {
        circles[circleId].isActive = false;
    }

    /**
     * @dev Deposit funds to circle treasury
     */
    function deposit(uint256 circleId) external payable {
        Circle storage circle = circles[circleId];
        
        if (!circle.isActive) revert CircleNotActive();
        
        circle.treasuryBalance += msg.value;
        contributions[circleId][msg.sender] += msg.value;
        lastContributionTime[circleId][msg.sender] = block.timestamp;
        
        emit Deposit(circleId, msg.sender, msg.value);
    }

    /**
     * @dev Withdraw funds from circle treasury (owner only)
     */
    function withdraw(uint256 circleId, uint256 amount, address to) external {
        Circle storage circle = circles[circleId];
        
        if (circle.owner != msg.sender) revert NotCircleOwner();
        if (circle.treasuryBalance < amount) revert InsufficientBalance();
        
        circle.treasuryBalance -= amount;
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(circleId, to, amount);
    }

    /**
     * @dev Process recurring payment for a member
     */
    function processRecurringPayment(uint256 circleId, address member) external payable {
        Circle storage circle = circles[circleId];
        
        if (!circle.isActive) revert CircleNotActive();
        
        uint256 lastPayment = lastContributionTime[circleId][member];
        if (block.timestamp < lastPayment + circle.contributionInterval) {
            revert PaymentNotDue();
        }
        
        require(msg.value >= circle.contributionAmount, "Insufficient payment amount");
        
        circle.treasuryBalance += msg.value;
        contributions[circleId][member] += msg.value;
        lastContributionTime[circleId][member] = block.timestamp;
        
        emit RecurringPaymentProcessed(circleId, member);
        emit Deposit(circleId, member, msg.value);
    }

    /**
     * @dev Get circle treasury balance
     */
    function getCircleBalance(uint256 circleId) external view returns (uint256) {
        return circles[circleId].treasuryBalance;
    }

    /**
     * @dev Get member's total contributions to a circle
     */
    function getMemberContributions(uint256 circleId, address member) external view returns (uint256) {
        return contributions[circleId][member];
    }

    /**
     * @dev Check if payment is due for a member
     */
    function isPaymentDue(uint256 circleId, address member) external view returns (bool) {
        Circle storage circle = circles[circleId];
        uint256 lastPayment = lastContributionTime[circleId][member];
        return block.timestamp >= lastPayment + circle.contributionInterval;
    }

    /**
     * @dev Set Grove contract address (admin only)
     */
    function setGrove(address _grove) external onlyAdmin {
        require(_grove != address(0), "Invalid grove address");
        grove = _grove;
    }

    /**
     * @dev Update Grove contract address (only current Grove) 
     */
    function updateGrove(address newGrove) external onlyGrove {
        require(newGrove != address(0), "Invalid grove address");
        grove = newGrove;
    }
}
