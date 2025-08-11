// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InheritanceModule
 * @notice Handles inheritance and beneficiary logic for Grove circles
 * @dev Integrates with existing Grove/SatVault system
 */
contract InheritanceModule {
    struct Beneficiary {
        address beneficiary;
        uint256 share;
    }

    // circleId => owner => beneficiaries (existing functionality)
    mapping(uint256 => mapping(address => Beneficiary[])) public circleBeneficiaries;
    
    // Enhanced inheritance tracking
    mapping(uint256 => mapping(address => bool)) public inheritanceActive;
    mapping(uint256 => mapping(address => uint256)) public inheritanceAmount;
    mapping(uint256 => mapping(address => mapping(address => bool))) public hasClaimed;
    
    // Configuration
    address public grove;
    address public satVault;
    
    // More flexible inheritance triggers
    mapping(uint256 => mapping(address => uint256)) public lastActivity;
    uint256 public constant INACTIVITY_PERIOD = 90 days;

    event BeneficiarySet(uint256 indexed circleId, address indexed owner, address indexed beneficiary, uint256 share);
    event InheritanceActivated(uint256 indexed circleId, address indexed deceased, uint256 totalAmount);
    event InheritanceClaimed(uint256 indexed circleId, address indexed beneficiary, address indexed deceased, uint256 amount);
    event ActivityRecorded(uint256 indexed circleId, address indexed member);

    modifier onlyGrove() {
        require(msg.sender == grove, "Only Grove can call this");
        _;
    }

    modifier onlySatVault() {
        require(msg.sender == satVault, "Only SatVault can call this");
        _;
    }

    // EXISTING FUNCTION - Keep backward compatibility
    function setBeneficiaries(uint256 circleId, Beneficiary[] calldata beneficiaries) external {
        require(beneficiaries.length > 0, "No beneficiaries");
        uint256 totalShare = 0;
        
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
        
        // Record activity
        lastActivity[circleId][msg.sender] = block.timestamp;
        emit ActivityRecorded(circleId, msg.sender);
    }

    // CONFIGURATION FUNCTIONS
    function setGrove(address _grove) external {
        require(grove == address(0) || msg.sender == grove, "Only current Grove");
        grove = _grove;
    }

    function setSatVault(address _satVault) external {
        require(grove == address(0) || msg.sender == grove, "Only Grove can set SatVault");
        satVault = _satVault;
    }
    
    // ACTIVITY TRACKING (called by SatVault on contributions)
    function recordActivity(uint256 circleId, address member) external onlySatVault {
        lastActivity[circleId][member] = block.timestamp;
        emit ActivityRecorded(circleId, member);
    }
    
    // INHERITANCE WORKFLOW
    
    // Check if inheritance can be activated (flexible - not just inactivity)
    function canActivateInheritance(uint256 circleId, address member) public view returns (bool) {
        // Option 1: Inactivity-based (90 days)
        uint256 lastSeen = lastActivity[circleId][member];
        bool inactive = lastSeen > 0 && (block.timestamp - lastSeen) >= INACTIVITY_PERIOD;
        
        // Option 2: Manual activation (circle owner can trigger)
        // This allows immediate inheritance without waiting 90 days
        
        return inactive || circleBeneficiaries[circleId][member].length > 0;
    }
    
    // Activate inheritance (can be called by anyone if criteria met)
    function activateInheritance(uint256 circleId, address deceased, uint256 amount) external {
        require(!inheritanceActive[circleId][deceased], "Already active");
        require(circleBeneficiaries[circleId][deceased].length > 0, "No beneficiaries");
        
        // Allow Grove contract or circle members to trigger inheritance
        // This makes it more flexible than just inactivity-based
        bool canActivate = false;
        
        // Option 1: Called by Grove contract
        if (msg.sender == grove) {
            canActivate = true;
        }
        // Option 2: Inactivity period met
        else if (canActivateInheritance(circleId, deceased)) {
            canActivate = true;
        }
        
        require(canActivate, "Cannot activate inheritance");
        require(amount > 0, "No amount to inherit");
        
        inheritanceActive[circleId][deceased] = true;
        inheritanceAmount[circleId][deceased] = amount;
        
        emit InheritanceActivated(circleId, deceased, amount);
    }
    
    // Claim inheritance (returns amount to be withdrawn from SatVault)
    function claimInheritance(uint256 circleId, address deceased) external returns (uint256 claimAmount) {
        require(inheritanceActive[circleId][deceased], "Not activated");
        require(!hasClaimed[circleId][deceased][msg.sender], "Already claimed");
        
        // Find beneficiary share
        Beneficiary[] memory beneficiaries = circleBeneficiaries[circleId][deceased];
        uint256 beneficiaryShare = 0;
        
        for (uint i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i].beneficiary == msg.sender) {
                beneficiaryShare = beneficiaries[i].share;
                break;
            }
        }
        
        require(beneficiaryShare > 0, "Not a beneficiary");
        
        // Calculate claim amount
        uint256 totalAmount = inheritanceAmount[circleId][deceased];
        claimAmount = (totalAmount * beneficiaryShare) / 10000;
        require(claimAmount > 0, "Nothing to claim");
        
        // Mark as claimed
        hasClaimed[circleId][deceased][msg.sender] = true;
        
        emit InheritanceClaimed(circleId, msg.sender, deceased, claimAmount);
        
        // Return amount - caller (Grove/UI) handles actual transfer
        return claimAmount;
    }
    
    // VIEW FUNCTIONS
    function getBeneficiaries(uint256 circleId, address owner) external view returns (Beneficiary[] memory) {
        return circleBeneficiaries[circleId][owner];
    }
    
    function getInheritanceInfo(uint256 circleId, address deceased) external view returns (bool active, uint256 amount) {
        return (inheritanceActive[circleId][deceased], inheritanceAmount[circleId][deceased]);
    }
}
