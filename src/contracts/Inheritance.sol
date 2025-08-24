// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Treasury.sol";
import "./Grove.sol";

/**
 * @title Inheritance - Fully Decentralized Beneficiary System
 * @notice Handles inheritance with flexible activation triggers - NO ADMIN CONTROL
 * @dev Direct Treasury integration, multiple activation options, fully autonomous
 */
contract Inheritance is AccessControl {
    Treasury public treasury;
    Grove public grove;
    
    struct Beneficiary {
        address beneficiary;
        uint256 share; // Out of 10000 (100.00%)
    }
    
    struct InheritanceInfo {
        bool isActive;
        uint256 activatedAt;
        uint256 totalAmount;
        address activatedBy;
        string activationReason;
    }
    
    // circleId => deceased => beneficiaries
    mapping(uint256 => mapping(address => Beneficiary[])) public beneficiaries;
    
    // circleId => deceased => inheritance info
    mapping(uint256 => mapping(address => InheritanceInfo)) public inheritanceStatus;
    
    // circleId => deceased => beneficiary => claimed
    mapping(uint256 => mapping(address => mapping(address => bool))) public hasClaimed;
    
    // Activity tracking for inactivity-based activation
    mapping(uint256 => mapping(address => uint256)) public lastActivity;
    
    // Configuration
    uint256 public constant INACTIVITY_PERIOD = 90 days;
    uint256 public constant MAX_BENEFICIARIES = 10;
    
    event BeneficiariesSet(uint256 indexed circleId, address indexed owner, uint256 beneficiaryCount);
    event InheritanceActivated(uint256 indexed circleId, address indexed deceased, uint256 amount, string reason);
    event InheritanceClaimed(uint256 indexed circleId, address indexed beneficiary, address indexed deceased, uint256 amount);
    
    constructor(address _treasury, address _grove) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        treasury = Treasury(_treasury);
        grove = Grove(_grove);
    }
    
    // ============ BENEFICIARY MANAGEMENT ============
    
    /**
     * @dev Set beneficiaries for inheritance (circle owner only)
     */
    function setBeneficiaries(
        uint256 circleId,
        address[] calldata _beneficiaries,
        uint256[] calldata _shares
    ) external {
        require(_beneficiaries.length > 0, "Must have at least one beneficiary");
        require(_beneficiaries.length <= MAX_BENEFICIARIES, "Too many beneficiaries");
        require(_beneficiaries.length == _shares.length, "Arrays length mismatch");
        
        // Check if caller is circle owner using corrected destructuring
        (, , , address owner, , , , , , , , ) = grove.getCircle(circleId);
        require(msg.sender == owner, "Only circle owner can set beneficiaries");
        
        // Validate shares sum to 10000 (100%)
        uint256 totalShares = 0;
        for (uint i = 0; i < _shares.length; i++) {
            require(_beneficiaries[i] != address(0), "Invalid beneficiary address");
            require(_shares[i] > 0, "Share must be greater than 0");
            totalShares += _shares[i];
        }
        require(totalShares == 10000, "Shares must sum to 100%");
        
        // Clear existing beneficiaries
        delete beneficiaries[circleId][msg.sender];
        
        // Set new beneficiaries
        for (uint i = 0; i < _beneficiaries.length; i++) {
            beneficiaries[circleId][msg.sender].push(Beneficiary({
                beneficiary: _beneficiaries[i],
                share: _shares[i]
            }));
        }
        
        emit BeneficiariesSet(circleId, msg.sender, _beneficiaries.length);
    }
    
    // ============ INHERITANCE ACTIVATION ============
    
    /**
     * @dev Activate inheritance for a deceased member
     */
    function activateInheritance(
        uint256 circleId,
        address deceased,
        string calldata reason
    ) external {
        require(!inheritanceStatus[circleId][deceased].isActive, "Already activated");
        require(beneficiaries[circleId][deceased].length > 0, "No beneficiaries set");
        
        bool canActivate = false;
        
        // Option 1: Self-activation (member can activate their own inheritance)
        if (grove.isMemberOf(circleId, deceased) && msg.sender == deceased) {
            canActivate = true;
        }
        // Option 2: Inactivity period met (anyone can trigger)
        else if (lastActivity[circleId][deceased] > 0) {
            uint256 timeSinceActivity = block.timestamp - lastActivity[circleId][deceased];
            if (timeSinceActivity >= INACTIVITY_PERIOD) {
                canActivate = true;
            }
        }
        // Option 3: Emergency activation by any circle member (with reason)
        else if (grove.isMemberOf(circleId, msg.sender) && bytes(reason).length > 0) {
            canActivate = true;
        }
        
        require(canActivate, "Not authorized to activate inheritance");
        
        uint256 memberContribution = treasury.getMemberContribution(circleId, deceased);
        require(memberContribution > 0, "No contribution to inherit");
        
        inheritanceStatus[circleId][deceased] = InheritanceInfo({
            isActive: true,
            activatedAt: block.timestamp,
            totalAmount: memberContribution,
            activatedBy: msg.sender,
            activationReason: reason
        });
        
        emit InheritanceActivated(circleId, deceased, memberContribution, reason);
    }
    
    /**
     * @dev Update activity timestamp for a member
     */
    function updateActivity(uint256 circleId, address member) external {
        require(msg.sender == address(grove), "Only Grove can update activity");
        lastActivity[circleId][member] = block.timestamp;
    }
    
    // ============ INHERITANCE CLAIMING ============
    
    /**
     * @dev Claim inheritance as a beneficiary
     */
    function claimInheritance(
        uint256 circleId,
        address deceased
    ) external {
        require(inheritanceStatus[circleId][deceased].isActive, "Inheritance not activated");
        require(!hasClaimed[circleId][deceased][msg.sender], "Already claimed");
        
        // Find beneficiary and calculate claim amount
        Beneficiary[] memory _beneficiaries = beneficiaries[circleId][deceased];
        uint256 claimAmount = 0;
        bool isBeneficiary = false;
        
        for (uint i = 0; i < _beneficiaries.length; i++) {
            if (_beneficiaries[i].beneficiary == msg.sender) {
                claimAmount = (inheritanceStatus[circleId][deceased].totalAmount * _beneficiaries[i].share) / 10000;
                isBeneficiary = true;
                break;
            }
        }
        
        require(isBeneficiary, "Not a beneficiary");
        require(claimAmount > 0, "Nothing to claim");
        
        // Mark as claimed
        hasClaimed[circleId][deceased][msg.sender] = true;
        
        // Execute withdrawal through Treasury
        treasury.executeInheritanceWithdrawal(circleId, deceased, msg.sender, claimAmount);
        
        emit InheritanceClaimed(circleId, msg.sender, deceased, claimAmount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get beneficiaries for a member
     */
    function getBeneficiaries(uint256 circleId, address member) external view returns (
        address[] memory _beneficiaries,
        uint256[] memory _shares
    ) {
        Beneficiary[] memory beneficiaryList = beneficiaries[circleId][member];
        _beneficiaries = new address[](beneficiaryList.length);
        _shares = new uint256[](beneficiaryList.length);
        
        for (uint i = 0; i < beneficiaryList.length; i++) {
            _beneficiaries[i] = beneficiaryList[i].beneficiary;
            _shares[i] = beneficiaryList[i].share;
        }
    }
    
    /**
     * @dev Check inheritance status
     */
    function getInheritanceStatus(uint256 circleId, address member) external view returns (
        bool isActive,
        uint256 activatedAt,
        uint256 totalAmount,
        address activatedBy,
        string memory activationReason
    ) {
        InheritanceInfo memory info = inheritanceStatus[circleId][member];
        return (
            info.isActive,
            info.activatedAt,
            info.totalAmount,
            info.activatedBy,
            info.activationReason
        );
    }
    
    /**
     * @dev Check if user can activate inheritance for a member
     */
    function canActivateInheritance(uint256 circleId, address deceased, address activator) external view returns (bool) {
        if (inheritanceStatus[circleId][deceased].isActive) return false;
        if (beneficiaries[circleId][deceased].length == 0) return false;
        
        // Self-activation
        if (grove.isMemberOf(circleId, deceased) && activator == deceased) {
            return true;
        }
        
        // Inactivity period met
        if (lastActivity[circleId][deceased] > 0) {
            uint256 timeSinceActivity = block.timestamp - lastActivity[circleId][deceased];
            if (timeSinceActivity >= INACTIVITY_PERIOD) {
                return true;
            }
        }
        
        // Circle member emergency activation
        if (grove.isMemberOf(circleId, activator)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Calculate claimable amount for a beneficiary
     */
    function getClaimableAmount(uint256 circleId, address deceased, address beneficiary) external view returns (uint256) {
        if (!inheritanceStatus[circleId][deceased].isActive) return 0;
        if (hasClaimed[circleId][deceased][beneficiary]) return 0;
        
        Beneficiary[] memory _beneficiaries = beneficiaries[circleId][deceased];
        for (uint i = 0; i < _beneficiaries.length; i++) {
            if (_beneficiaries[i].beneficiary == beneficiary) {
                return (inheritanceStatus[circleId][deceased].totalAmount * _beneficiaries[i].share) / 10000;
            }
        }
        
        return 0;
    }
}
