// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InheritanceModule
 * @notice Handles inheritance and beneficiary logic for Grove circles
 */

// Interface for SatVault integration
interface ISatVault {
    function getMemberContributions(uint256 circleId, address member) external view returns (uint256);
    function withdrawInheritance(uint256 circleId, address deceased, address beneficiary, uint256 amount) external;
}
/**
 * @dev Enhanced inheritance system: stores beneficiary data and handles actual inheritance claims.
 *      Integrates with SatVault for secure fund distribution.
 */
contract InheritanceModule {
    struct Beneficiary {
        address beneficiary;
        uint256 share;
    }

    struct InheritanceClaim {
        bool isActive;
        uint256 activatedAt;
        uint256 totalAmount;
        mapping(address => bool) hasClaimed;
    }

    // circleId => owner => beneficiaries
    mapping(uint256 => mapping(address => Beneficiary[])) public circleBeneficiaries;
    
    // circleId => deceased => InheritanceClaim
    mapping(uint256 => mapping(address => InheritanceClaim)) public inheritanceClaims;
    
    // Security and configuration
    address public satVault;
    uint256 public constant INACTIVITY_PERIOD = 90 days; // 3 months inactivity triggers inheritance
    
    // Track last activity for inheritance triggers
    mapping(uint256 => mapping(address => uint256)) public lastActivity;

    event BeneficiarySet(uint256 indexed circleId, address indexed owner, address indexed beneficiary, uint256 share);
    event InheritanceActivated(uint256 indexed circleId, address indexed deceased, uint256 totalAmount);
    event InheritanceClaimed(uint256 indexed circleId, address indexed beneficiary, address indexed deceased, uint256 amount);
    event ActivityRecorded(uint256 indexed circleId, address indexed member);


    // EXISTING FUNCTION - UNCHANGED for backward compatibility
    function setBeneficiaries(uint256 circleId, Beneficiary[] calldata beneficiaries) external {
        require(beneficiaries.length > 0, "No beneficiaries");
        uint256 totalShare = 0;
        // Enforce unique beneficiaries
        for (uint i = 0; i < beneficiaries.length; i++) {
            for (uint j = i + 1; j < beneficiaries.length; j++) {
                require(beneficiaries[i].beneficiary != beneficiaries[j].beneficiary, "Duplicate beneficiary");
            }
        }
        delete circleBeneficiaries[circleId][msg.sender];
        for (uint i = 0; i < beneficiaries.length; i++) {
            require(beneficiaries[i].beneficiary != address(0), "Zero address");
            require(beneficiaries[i].share > 0, "Zero share");
            totalShare += beneficiaries[i].share;
            circleBeneficiaries[circleId][msg.sender].push(beneficiaries[i]);
            emit BeneficiarySet(circleId, msg.sender, beneficiaries[i].beneficiary, beneficiaries[i].share);
        }
        require(totalShare == 10000, "Total share must be 10000");
        
        // NEW: Record activity when setting beneficiaries
        lastActivity[circleId][msg.sender] = block.timestamp;
        emit ActivityRecorded(circleId, msg.sender);
    }

    // NEW FUNCTIONS for proper inheritance workflow
    
    /**
     * @dev Set SatVault contract address (admin only)
     */
    function setSatVault(address _satVault) external {
        require(_satVault != address(0), "Invalid SatVault address");
        // TODO: Add proper admin check when admin system is defined
        satVault = _satVault;
    }
    
    /**
     * @dev Record activity for a member (called by SatVault on contributions)
     */
    function recordActivity(uint256 circleId, address member) external {
        require(msg.sender == satVault, "Only SatVault can record activity");
        lastActivity[circleId][member] = block.timestamp;
        emit ActivityRecorded(circleId, member);
    }
    
    /**
     * @dev Check if inheritance can be activated due to inactivity
     */
    function canActivateInheritance(uint256 circleId, address member) public view returns (bool) {
        uint256 lastSeen = lastActivity[circleId][member];
        return lastSeen > 0 && (block.timestamp - lastSeen) >= INACTIVITY_PERIOD;
    }
    
    /**
     * @dev Activate inheritance for an inactive member
     */
    function activateInheritance(uint256 circleId, address deceased) external {
        require(canActivateInheritance(circleId, deceased), "Cannot activate inheritance yet");
        require(!inheritanceClaims[circleId][deceased].isActive, "Inheritance already active");
        require(circleBeneficiaries[circleId][deceased].length > 0, "No beneficiaries set");
        
        // Get member's contribution amount from SatVault
        ISatVault vault = ISatVault(satVault);
        uint256 memberContributions = vault.getMemberContributions(circleId, deceased);
        require(memberContributions > 0, "No contributions to inherit");
        
        // Activate inheritance claim
        inheritanceClaims[circleId][deceased].isActive = true;
        inheritanceClaims[circleId][deceased].activatedAt = block.timestamp;
        inheritanceClaims[circleId][deceased].totalAmount = memberContributions;
        
        emit InheritanceActivated(circleId, deceased, memberContributions);
    }
    
    /**
     * @dev Claim inheritance as a beneficiary
     */
    function claimInheritance(uint256 circleId, address deceased) external {
        InheritanceClaim storage claim = inheritanceClaims[circleId][deceased];
        require(claim.isActive, "Inheritance not activated");
        require(!claim.hasClaimed[msg.sender], "Already claimed");
        
        // Find beneficiary and calculate share
        Beneficiary[] memory beneficiaries = circleBeneficiaries[circleId][deceased];
        uint256 beneficiaryShare = 0;
        
        for (uint i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].beneficiary == msg.sender) {
                beneficiaryShare = beneficiaries[i].share;
                break;
            }
        }
        
        require(beneficiaryShare > 0, "Not a beneficiary");
        
        // Calculate amount to claim (share out of 10000)
        uint256 claimAmount = (claim.totalAmount * beneficiaryShare) / 10000;
        require(claimAmount > 0, "Nothing to claim");
        
        // Mark as claimed
        claim.hasClaimed[msg.sender] = true;
        
        // Request withdrawal from SatVault
        ISatVault(satVault).withdrawInheritance(circleId, deceased, msg.sender, claimAmount);
        
        emit InheritanceClaimed(circleId, msg.sender, deceased, claimAmount);
    }
    
    /**
     * @dev Get beneficiaries for a circle member
     */
    function getBeneficiaries(uint256 circleId, address owner) external view returns (Beneficiary[] memory) {
        return circleBeneficiaries[circleId][owner];
    }
    
    /**
     * @dev Check if a beneficiary has already claimed inheritance
     */
    function hasClaimed(uint256 circleId, address deceased, address beneficiary) external view returns (bool) {
        return inheritanceClaims[circleId][deceased].hasClaimed[beneficiary];
    }
}
