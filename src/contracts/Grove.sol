// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Grove {
    enum PaymentType { OneTime, Recurring }
    
    struct Circle {
        uint id;
        address owner;
        string name;
        PaymentType paymentType;
        uint contributionAmount; // in sats
        uint nextPaymentDue; // timestamp for recurring
        address[] members;
    }
    
    // Storage
    uint public circleCount;
    mapping(uint => Circle) public circles;
    mapping(uint => uint) public circleTreasury; // circleId => total sats
    
    // Events
    event CircleCreated(uint circleId, address owner, string name, PaymentType paymentType);
    event MemberAdded(uint circleId, address member);
    event ContributionMade(uint circleId, address member, uint amount);
    
    // Create circle
    function createCircle(
        string memory _name,
        PaymentType _paymentType,
        uint _contributionAmount,
        address[] memory _initialMembers
    ) external {
        uint circleId = circleCount++;
        circles[circleId] = Circle({
            id: circleId,
            owner: msg.sender,
            name: _name,
            paymentType: _paymentType,
            contributionAmount: _contributionAmount,
            nextPaymentDue: _paymentType == PaymentType.Recurring ? block.timestamp + 30 days : 0,
            members: _initialMembers
        });
        
        // Add creator as member
        circles[circleId].members.push(msg.sender);
        
        emit CircleCreated(circleId, msg.sender, _name, _paymentType);
    }
    
    // Add member
    function addMember(uint circleId, address newMember) external {
        require(msg.sender == circles[circleId].owner, "Only owner can add members");
        circles[circleId].members.push(newMember);
        emit MemberAdded(circleId, newMember);
    }
    
    // Make payment
    function contribute(uint circleId) external payable {
        require(isMember(circleId, msg.sender), "Not a circle member");
        require(msg.value == circles[circleId].contributionAmount, "Incorrect amount");
        
        // Update treasury
        circleTreasury[circleId] += msg.value;
        
        // Update next payment due if recurring
        if(circles[circleId].paymentType == PaymentType.Recurring) {
            circles[circleId].nextPaymentDue += 30 days;
        }
        
        emit ContributionMade(circleId, msg.sender, msg.value);
    }
    
    // Check membership
    function isMember(uint circleId, address user) public view returns (bool) {
        for(uint i = 0; i < circles[circleId].members.length; i++) {
            if(circles[circleId].members[i] == user) return true;
        }
        return false;
    }
    
    // Get circle members
    function getMembers(uint circleId) public view returns (address[] memory) {
        return circles[circleId].members;
    }
}