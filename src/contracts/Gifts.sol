// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Treasury.sol";
import "./Grove.sol";

/**
 * @title Gifts - One-Time Payment Circles
 * @notice Create gift circles where multiple people contribute for one specific recipient
 * @dev Fully decentralized system for collective gift-giving - NO ADMIN CONTROL
 */
contract Gifts is AccessControl, ReentrancyGuard {
    Treasury public treasury;
    Grove public grove;
    
    struct GiftCircle {
        uint256 id;
        string title;
        string description;
        address organizer;
        address recipient;
        string recipientEmail;
        uint256 targetAmount;
        uint256 totalContributed;
        uint256 createdAt;
        uint256 expiresAt;
        bool claimed;
        bool active;
        address[] contributors;
        mapping(address => uint256) contributions;
    }
    
    struct ContributorInfo {
        address contributor;
        uint256 amount;
        uint256 timestamp;
        string message;
    }
    
    mapping(uint256 => GiftCircle) public giftCircles;
    mapping(uint256 => ContributorInfo[]) public giftContributions;
    mapping(address => uint256[]) public organizerCircles;
    mapping(address => uint256[]) public recipientCircles;
    mapping(string => uint256[]) public emailCircles;
    
    uint256 public nextCircleId = 1;
    uint256 public constant MIN_CONTRIBUTION = 0.0001 ether;
    uint256 public constant MAX_DURATION = 365 days;
    uint256 public constant DEFAULT_DURATION = 30 days;
    
    // Events
    event GiftCircleCreated(uint256 indexed circleId, address indexed organizer, address indexed recipient, string title, uint256 targetAmount);
    event ContributionMade(uint256 indexed circleId, address indexed contributor, uint256 amount, string message);
    event GiftClaimed(uint256 indexed circleId, address indexed recipient, uint256 totalAmount);
    event GiftCircleExpired(uint256 indexed circleId, uint256 totalRefunded);
    event RefundClaimed(uint256 indexed circleId, address indexed contributor, uint256 amount);
    
    constructor(address _treasury, address _grove) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        treasury = Treasury(_treasury);
        grove = Grove(_grove);
    }
    
    // ============ GIFT CIRCLE CREATION ============
    
    /**
     * @dev Create a new gift circle for someone specific
     */
    function createGiftCircle(
        string calldata title,
        string calldata description,
        address recipient,
        string calldata recipientEmail,
        uint256 targetAmount,
        uint256 durationDays
    ) external returns (uint256 circleId) {
        require(bytes(title).length > 0, "Title required");
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot create gift circle for yourself");
        require(targetAmount > 0, "Target amount must be positive");
        require(durationDays > 0 && durationDays <= 365, "Invalid duration");
        require(bytes(recipientEmail).length > 0, "Recipient email required");
        
        circleId = nextCircleId++;
        GiftCircle storage circle = giftCircles[circleId];
        
        circle.id = circleId;
        circle.title = title;
        circle.description = description;
        circle.organizer = msg.sender;
        circle.recipient = recipient;
        circle.recipientEmail = recipientEmail;
        circle.targetAmount = targetAmount;
        circle.totalContributed = 0;
        circle.createdAt = block.timestamp;
        circle.expiresAt = block.timestamp + (durationDays * 1 days);
        circle.claimed = false;
        circle.active = true;
        
        // Track circles
        organizerCircles[msg.sender].push(circleId);
        recipientCircles[recipient].push(circleId);
        emailCircles[recipientEmail].push(circleId);
        
        emit GiftCircleCreated(circleId, msg.sender, recipient, title, targetAmount);
        return circleId;
    }
    
    // ============ CONTRIBUTIONS ============
    
    /**
     * @dev Contribute to a gift circle
     */
    function contributeToGiftCircle(
        uint256 circleId,
        string calldata message
    ) external payable nonReentrant {
        require(msg.value >= MIN_CONTRIBUTION, "Contribution too small");
        
        GiftCircle storage circle = giftCircles[circleId];
        require(circle.active, "Gift circle not active");
        require(block.timestamp <= circle.expiresAt, "Gift circle has expired");
        require(msg.sender != circle.recipient, "Recipient cannot contribute to own gift");
        
        // Record contribution
        if (circle.contributions[msg.sender] == 0) {
            circle.contributors.push(msg.sender);
        }
        circle.contributions[msg.sender] += msg.value;
        circle.totalContributed += msg.value;
        
        // Add to contributions history
        giftContributions[circleId].push(ContributorInfo({
            contributor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            message: message
        }));
        
        emit ContributionMade(circleId, msg.sender, msg.value, message);
    }
    
    // ============ CLAIMING ============
    
    /**
     * @dev Claim the collected gift (recipient only)
     */
    function claimGift(uint256 circleId) external nonReentrant {
        GiftCircle storage circle = giftCircles[circleId];
        
        require(circle.active, "Gift circle not active");
        require(msg.sender == circle.recipient, "Only recipient can claim");
        require(!circle.claimed, "Gift already claimed");
        require(circle.totalContributed > 0, "No contributions to claim");
        
        circle.claimed = true;
        circle.active = false;
        
        uint256 claimAmount = circle.totalContributed;
        
        // Transfer funds to recipient
        (bool success, ) = msg.sender.call{value: claimAmount}("");
        require(success, "Transfer failed");
        
        emit GiftClaimed(circleId, msg.sender, claimAmount);
    }
    
    // ============ EXPIRATION & REFUNDS ============
    
    /**
     * @dev Handle expired gift circle - allows contributors to claim refunds
     */
    function handleExpiredGiftCircle(uint256 circleId) external {
        GiftCircle storage circle = giftCircles[circleId];
        
        require(circle.active, "Gift circle not active");
        require(block.timestamp > circle.expiresAt, "Gift circle has not expired");
        require(!circle.claimed, "Gift already claimed");
        
        circle.active = false;
        
        emit GiftCircleExpired(circleId, circle.totalContributed);
    }
    
    /**
     * @dev Claim refund from expired gift circle
     */
    function claimRefund(uint256 circleId) external nonReentrant {
        GiftCircle storage circle = giftCircles[circleId];
        
        require(!circle.active, "Gift circle still active");
        require(block.timestamp > circle.expiresAt, "Gift circle has not expired");
        require(!circle.claimed, "Gift was already claimed");
        require(circle.contributions[msg.sender] > 0, "No contribution to refund");
        
        uint256 refundAmount = circle.contributions[msg.sender];
        circle.contributions[msg.sender] = 0;
        
        // Transfer refund
        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund transfer failed");
        
        emit RefundClaimed(circleId, msg.sender, refundAmount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get gift circle details
     */
    function getGiftCircle(uint256 circleId) external view returns (
        string memory title,
        string memory description,
        address organizer,
        address recipient,
        string memory recipientEmail,
        uint256 targetAmount,
        uint256 totalContributed,
        uint256 expiresAt,
        bool claimed,
        bool active,
        uint256 contributorCount
    ) {
        GiftCircle storage circle = giftCircles[circleId];
        return (
            circle.title,
            circle.description,
            circle.organizer,
            circle.recipient,
            circle.recipientEmail,
            circle.targetAmount,
            circle.totalContributed,
            circle.expiresAt,
            circle.claimed,
            circle.active,
            circle.contributors.length
        );
    }
    
    /**
     * @dev Get contribution amount for a user in a gift circle
     */
    function getUserContribution(uint256 circleId, address user) external view returns (uint256) {
        return giftCircles[circleId].contributions[user];
    }
    
    /**
     * @dev Get all contributors for a gift circle
     */
    function getContributors(uint256 circleId) external view returns (address[] memory) {
        return giftCircles[circleId].contributors;
    }
    
    /**
     * @dev Get contribution history for a gift circle
     */
    function getContributionHistory(uint256 circleId) external view returns (ContributorInfo[] memory) {
        return giftContributions[circleId];
    }
    
    /**
     * @dev Get gift circles organized by a user
     */
    function getOrganizerCircles(address organizer) external view returns (uint256[] memory) {
        return organizerCircles[organizer];
    }
    
    /**
     * @dev Get gift circles for a recipient
     */
    function getRecipientCircles(address recipient) external view returns (uint256[] memory) {
        return recipientCircles[recipient];
    }
    
    /**
     * @dev Get gift circles by email
     */
    /**
     * @dev Get gift circles by email
     */
    function getEmailCircles(string calldata email) external view returns (uint256[] memory) {
        return emailCircles[email];
    }
}
