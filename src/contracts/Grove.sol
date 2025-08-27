// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Treasury.sol";


/**
 * @title Grove - Core Platform Management
 * @notice Main contract for savings circles with Treasury integration
 * @dev Handles circle creation, member management, and achievement tracking
 * @dev FULLY DECENTRALIZED - No admin controls
 */
contract Grove is ReentrancyGuard {
    
    Treasury public treasury;
    Achievements public achievements;
    
    struct Circle {
        uint256 id;
        string name;
        string description;
        address owner;
        uint256 targetAmount;
        uint256 contributionAmount;
        uint256 contributionInterval;
        uint256 createdAt;
        uint256 deadline;
        bool isPublic;
        bool isActive;
        address[] members;
        mapping(address => bool) isMember;
        mapping(address => uint256) joinedAt;
    }
    
    struct PublicCircleInfo {
        uint256 id;
        string name;
        string description;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 memberCount;
        uint256 timeRemaining;
        address owner;
    }
    
    mapping(uint256 => Circle) public circles;
    mapping(address => uint256[]) public userCircles;
    uint256 public nextCircleId = 1;
    uint256[] public publicCircleIds;
    
    // Achievement tracking
    mapping(address => uint256) public userTotalContributions;
    mapping(address => uint256) public userCircleCount;
    mapping(address => uint256) public userInviteCount;
    mapping(address => uint256) public lastActivityTime;
    
    // Events
    event CircleCreated(uint256 indexed circleId, address indexed owner, string name, bool isPublic);
    event MemberJoined(uint256 indexed circleId, address indexed member);
    event MemberLeft(uint256 indexed circleId, address indexed member);
    event ContributionMade(uint256 indexed circleId, address indexed member, uint256 amount);
    event CircleCompleted(uint256 indexed circleId, uint256 totalAmount);
    event InvitationSent(uint256 indexed circleId, address indexed inviter, address indexed invitee);
    
    constructor(address _treasury, address _achievements) {
        treasury = Treasury(_treasury);
        achievements = Achievements(_achievements);
    }
    
    // ============ CIRCLE MANAGEMENT ============
    
    /**
     * @dev Create a new savings circle
     */
    function createCircle(
        string memory name,
        string memory description,
        uint256 targetAmount,
        uint256 contributionAmount,
        uint256 contributionInterval,
        uint256 durationDays,
        bool isPublic
    ) external returns (uint256 circleId) {
        require(bytes(name).length > 0, "Name required");
        require(targetAmount > 0, "Target amount must be positive");
        
        circleId = nextCircleId++;
        Circle storage circle = circles[circleId];
        
        circle.id = circleId;
        circle.name = name;
        circle.description = description;
        circle.owner = msg.sender;
        circle.targetAmount = targetAmount;
        circle.contributionAmount = contributionAmount;
        circle.contributionInterval = contributionInterval;
        circle.createdAt = block.timestamp;
        circle.isPublic = isPublic;
        circle.isActive = true;
        
        // Auto-calculate deadline if duration provided
        if (durationDays > 0) {
            circle.deadline = block.timestamp + (durationDays * 1 days);
        } else if (contributionAmount > 0 && contributionInterval > 0) {
            // Auto-calculate based on contribution schedule
            uint256 paymentsNeeded = (targetAmount + contributionAmount - 1) / contributionAmount; // Round up
            circle.deadline = block.timestamp + (paymentsNeeded * contributionInterval);
        }
        
        // Add creator as first member
        circle.members.push(msg.sender);
        circle.isMember[msg.sender] = true;
        circle.joinedAt[msg.sender] = block.timestamp;
        
        userCircles[msg.sender].push(circleId);
        userCircleCount[msg.sender]++;
        
        if (isPublic) {
            publicCircleIds.push(circleId);
        }
        
        // Initialize in Treasury
        treasury.initializeCircle(
            circleId,
            msg.sender,
            targetAmount,
            contributionAmount,
            contributionInterval
        );
        
        emit CircleCreated(circleId, msg.sender, name, isPublic);
        return circleId;
    }
    
    /**
     * @dev Join a circle (public circles or by invitation)
     */
    function joinCircle(uint256 circleId) external {
        Circle storage circle = circles[circleId];
        require(circle.isActive, "Circle not active");
        require(!circle.isMember[msg.sender], "Already a member");
        require(circle.isPublic || _isInvited(circleId, msg.sender), "Not invited");
        
        circle.members.push(msg.sender);
        circle.isMember[msg.sender] = true;
        circle.joinedAt[msg.sender] = block.timestamp;
        
        userCircles[msg.sender].push(circleId);
        userCircleCount[msg.sender]++;
        
        // Update achievements for joining a new circle
        achievements.updateProgress(msg.sender, 0, true, false);
        
        emit MemberJoined(circleId, msg.sender);
    }
    
    /**
     * @dev Leave a circle (with penalties if applicable)
     */
    function leaveCircle(uint256 circleId) external {
        Circle storage circle = circles[circleId];
        require(circle.isMember[msg.sender], "Not a member");
        require(msg.sender != circle.owner, "Owner cannot leave");
        
        _removeMember(circleId, msg.sender);
        emit MemberLeft(circleId, msg.sender);
    }
    
    /**
     * @dev Remove member (owner only)
     */
    function removeMember(uint256 circleId, address member) external {
        Circle storage circle = circles[circleId];
        require(msg.sender == circle.owner, "Only owner can remove members");
        require(circle.isMember[member], "Not a member");
        require(member != circle.owner, "Cannot remove owner");
        
        _removeMember(circleId, member);
        emit MemberLeft(circleId, member);
    }
    
    function _removeMember(uint256 circleId, address member) internal {
        Circle storage circle = circles[circleId];
        
        // Remove from members array
        for (uint i = 0; i < circle.members.length; i++) {
            if (circle.members[i] == member) {
                circle.members[i] = circle.members[circle.members.length - 1];
                circle.members.pop();
                break;
            }
        }
        
        circle.isMember[member] = false;
        
        // Remove from user's circles
        uint256[] storage userCirclesList = userCircles[member];
        for (uint i = 0; i < userCirclesList.length; i++) {
            if (userCirclesList[i] == circleId) {
                userCirclesList[i] = userCirclesList[userCirclesList.length - 1];
                userCirclesList.pop();
                break;
            }
        }
        
        userCircleCount[member]--;
    }
    
    // ============ CONTRIBUTION MANAGEMENT ============
    
    /**
     * @dev Contribute to circle from user's vault
     */
    function contribute(uint256 circleId, uint256 amount) external nonReentrant {
        Circle storage circle = circles[circleId];
        require(circle.isActive, "Circle not active");
        require(circle.isMember[msg.sender], "Not a member");
        
        // For fixed contribution circles, amount must match
        if (circle.contributionAmount > 0) {
            require(amount == circle.contributionAmount, "Must contribute exact amount");
        }
        
        // Execute contribution through Treasury
        treasury.contributeToCircle(circleId, msg.sender, amount);
        
        // Update achievement tracking
        userTotalContributions[msg.sender] += amount;
        lastActivityTime[msg.sender] = block.timestamp;
        
        // Update achievements
        achievements.updateProgress(msg.sender, amount, false, false);
        
        emit ContributionMade(circleId, msg.sender, amount);
        
        // Check if circle is completed
        (uint256 currentAmount,,,,,,) = treasury.getCircleTreasury(circleId);
        if (currentAmount >= circle.targetAmount) {
            circle.isActive = false;
            emit CircleCompleted(circleId, currentAmount);
        }
    }
    
    // ============ PUBLIC CIRCLE DISCOVERY ============
    
    /**
     * @dev Get all public circles
     */
    function getPublicCircles() external view returns (PublicCircleInfo[] memory) {
        PublicCircleInfo[] memory publicCircles = new PublicCircleInfo[](publicCircleIds.length);
        
        for (uint i = 0; i < publicCircleIds.length; i++) {
            uint256 circleId = publicCircleIds[i];
            Circle storage circle = circles[circleId];
            
            if (circle.isActive && circle.isPublic) {
                (uint256 currentAmount,,,,,,) = treasury.getCircleTreasury(circleId);
                
                uint256 timeRemaining = 0;
                if (circle.deadline > block.timestamp) {
                    timeRemaining = circle.deadline - block.timestamp;
                }
                
                publicCircles[i] = PublicCircleInfo({
                    id: circle.id,
                    name: circle.name,
                    description: circle.description,
                    targetAmount: circle.targetAmount,
                    currentAmount: currentAmount,
                    memberCount: circle.members.length,
                    timeRemaining: timeRemaining,
                    owner: circle.owner
                });
            }
        }
        
        return publicCircles;
    }
    
    // ============ INVITATION SYSTEM ============
    
    mapping(uint256 => mapping(address => bool)) private invitations;
    
    /**
     * @dev Invite user to circle
     */
    function inviteToCircle(uint256 circleId, address invitee) external {
        Circle storage circle = circles[circleId];
        require(circle.isMember[msg.sender], "Must be member to invite");
        require(!circle.isMember[invitee], "Already a member");
        
        invitations[circleId][invitee] = true;
        userInviteCount[msg.sender]++;
        
        // Update achievements for sending invitation
        achievements.updateProgress(msg.sender, 0, false, true);
        
        emit InvitationSent(circleId, msg.sender, invitee);
    }
    
    function _isInvited(uint256 circleId, address user) internal view returns (bool) {
        return invitations[circleId][user];
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get circle details
     */
    function getCircle(uint256 circleId) external view returns (
        uint256 id,
        string memory name,
        string memory description,
        address owner,
        uint256 targetAmount,
        uint256 contributionAmount,
        uint256 contributionInterval,
        uint256 createdAt,
        uint256 deadline,
        bool isPublic,
        bool isActive,
        address[] memory members
    ) {
        Circle storage circle = circles[circleId];
        return (
            circle.id,
            circle.name,
            circle.description,
            circle.owner,
            circle.targetAmount,
            circle.contributionAmount,
            circle.contributionInterval,
            circle.createdAt,
            circle.deadline,
            circle.isPublic,
            circle.isActive,
            circle.members
        );
    }
    
    /**
     * @dev Check if user is member of circle
     */
    function isMemberOf(uint256 circleId, address user) external view returns (bool) {
        return circles[circleId].isMember[user];
    }
    
    /**
     * @dev Get user's circles
     */
    function getUserCircles(address user) external view returns (uint256[] memory) {
        return userCircles[user];
    }
    
    /**
     * @dev Get user's achievement stats
     */
    function getUserStats(address user) external view returns (
        uint256 totalContributed,
        uint256 circleCount,
        uint256 inviteCount,
        uint256 lastActivity
    ) {
        return (
            userTotalContributions[user],
            userCircleCount[user],
            userInviteCount[user],
            lastActivityTime[user]
        );
    }
    
    /**
     * @dev Calculate auto-completion date
     */
    function getAutoCompletionDate(uint256 circleId) external view returns (uint256) {
        Circle storage circle = circles[circleId];
        
        if (circle.contributionAmount == 0 || circle.contributionInterval == 0) {
            return circle.deadline; // Manual contributions, use set deadline
        }
        
        // Calculate based on payment schedule
        uint256 paymentsNeeded = (circle.targetAmount + circle.contributionAmount - 1) / circle.contributionAmount;
        return circle.createdAt + (paymentsNeeded * circle.contributionInterval);
    }
}
