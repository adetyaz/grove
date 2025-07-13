// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SatVault.sol";

contract Grove {
    SatVault public satVault;
    address public admin;
    uint256 public nextCircleId;

    struct Circle {
        uint id;
        address owner;
        string name;
        address[] members;
    }

    mapping(uint => Circle) public circles;
    mapping(uint => mapping(address => bool)) public isMember;

    event CircleCreated(uint circleId, address owner, string name);
    event MemberAdded(uint circleId, address member);
    event ContributionMade(uint circleId, address member, uint amount);

    modifier onlyCircleOwner(uint circleId) {
        require(circles[circleId].owner == msg.sender, "Not circle owner");
        _;
    }

    constructor(address _satVault) {
        satVault = SatVault(_satVault);
        admin = msg.sender;
        nextCircleId = 1;
    }

    function createCircle(string memory _name, uint _contributionAmount, uint _interval, uint _goal) external {
        uint circleId = nextCircleId++;
        Circle storage c = circles[circleId];
        c.id = circleId;
        c.owner = msg.sender;
        c.name = _name;
        c.members.push(msg.sender);
        isMember[circleId][msg.sender] = true;
        // Set up in SatVault
        satVault.setOwner(circleId, msg.sender);
        satVault.configureCircle(circleId, _contributionAmount, _interval, _goal);
        emit CircleCreated(circleId, msg.sender, _name);
    }

    function addMember(uint circleId, address newMember) external onlyCircleOwner(circleId) {
        require(!isMember[circleId][newMember], "Already member");
        circles[circleId].members.push(newMember);
        isMember[circleId][newMember] = true;
        emit MemberAdded(circleId, newMember);
    }

    function contribute(uint circleId) external payable {
        require(isMember[circleId][msg.sender], "Not a circle member");
        // Forward payment to SatVault
        satVault.deposit{value: msg.value}(circleId);
        emit ContributionMade(circleId, msg.sender, msg.value);
    }

    function isMemberOf(uint circleId, address user) public view returns (bool) {
        return isMember[circleId][user];
    }

    function getMembers(uint circleId) public view returns (address[] memory) {
        return circles[circleId].members;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function joinCircle(uint circleId) external {
        require(circles[circleId].id != 0, "Circle does not exist");
        require(!isMember[circleId][msg.sender], "Already member");
        circles[circleId].members.push(msg.sender);
        isMember[circleId][msg.sender] = true;
        emit MemberAdded(circleId, msg.sender);
    }

    /**
     * @dev Withdraw from circle (owner only, forwards to SatVault)
     */
    function withdraw(uint circleId, uint amount) external onlyCircleOwner(circleId) {
        satVault.withdraw(circleId, amount, msg.sender);
    }

    /**
     * @dev Get circle balance from SatVault
     */
    function getCircleBalance(uint circleId) external view returns (uint256) {
        return satVault.getCircleBalance(circleId);
    }

    /**
     * @dev Update SatVault address (admin only)
     */
    function updateSatVault(address newSatVault) external onlyAdmin {
        satVault = SatVault(newSatVault);
    }

    /**
     * @dev Update Grove address in SatVault (admin only) - for contract upgrades
     */
    function updateGroveInSatVault(address newGroveAddress) external onlyAdmin {
        satVault.updateGrove(newGroveAddress);
    }

    /**
     * @dev Get all circles for a user (for getUserCircles compatibility)
     */
    function getUserCircles(address user) external view returns (uint[] memory) {
        // Count user's circles first
        uint count = 0;
        for (uint i = 1; i < nextCircleId; i++) {
            if (isMember[i][user]) {
                count++;
            }
        }
        
        // Create array of user's circle IDs
        uint[] memory userCircles = new uint[](count);
        uint index = 0;
        for (uint i = 1; i < nextCircleId; i++) {
            if (isMember[i][user]) {
                userCircles[index] = i;
                index++;
            }
        }
        
        return userCircles;
    }
}