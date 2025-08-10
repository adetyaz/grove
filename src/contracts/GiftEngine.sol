// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GiftEngine
 * @notice Handles gifting between circle members with escrow functionality
 */
contract GiftEngine {
    struct EscrowGift {
        uint256 circleId;
        address sender;
        address recipient;
        uint256 amount;
        string message;
        bool claimed;
        uint256 createdAt;
        uint256 expiresAt;
    }

    mapping(bytes32 => EscrowGift) public escrowGifts;
    mapping(address => bytes32[]) public userGifts; // gifts sent to a user
    mapping(address => bytes32[]) public senderGifts; // gifts sent by a user

    event Gifted(uint256 indexed circleId, address indexed from, address indexed to, uint256 amount, string message);
    event EscrowGiftCreated(bytes32 indexed giftId, uint256 indexed circleId, address indexed from, address to, uint256 amount, string message);
    event EscrowGiftClaimed(bytes32 indexed giftId, address indexed recipient, uint256 amount);
    event EscrowGiftExpired(bytes32 indexed giftId, address indexed sender, uint256 amount);

    // Direct gift function (immediate transfer) - for known wallet addresses
    function gift(uint256 circleId, address to, string calldata message) external payable {
        require(msg.value > 0, "No gift amount");
        require(to != address(0), "Invalid recipient");
        
        payable(to).transfer(msg.value);
        emit Gifted(circleId, msg.sender, to, msg.value, message);
    }

    // Escrow gift function - for email-based gifts that need to be claimed
    function createEscrowGift(
        uint256 circleId, 
        address recipient, 
        string calldata message,
        uint256 expirationDays
    ) external payable returns (bytes32 giftId) {
        require(msg.value > 0, "No gift amount");
        require(recipient != address(0), "Invalid recipient");
        require(expirationDays > 0 && expirationDays <= 365, "Invalid expiration");

        giftId = keccak256(abi.encodePacked(
            msg.sender, 
            recipient, 
            circleId, 
            msg.value, 
            block.timestamp, 
            block.number
        ));

        escrowGifts[giftId] = EscrowGift({
            circleId: circleId,
            sender: msg.sender,
            recipient: recipient,
            amount: msg.value,
            message: message,
            claimed: false,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + (expirationDays * 1 days)
        });

        userGifts[recipient].push(giftId);
        senderGifts[msg.sender].push(giftId);

        emit EscrowGiftCreated(giftId, circleId, msg.sender, recipient, msg.value, message);
    }

    // Claim an escrow gift
    function claimEscrowGift(bytes32 giftId) external {
        EscrowGift storage escrowGift = escrowGifts[giftId];
        
        require(escrowGift.amount > 0, "Gift does not exist");
        require(!escrowGift.claimed, "Gift already claimed");
        require(block.timestamp <= escrowGift.expiresAt, "Gift has expired");
        require(msg.sender == escrowGift.recipient, "Not the gift recipient");

        escrowGift.claimed = true;
        payable(msg.sender).transfer(escrowGift.amount);

        emit EscrowGiftClaimed(giftId, msg.sender, escrowGift.amount);
    }

    // Reclaim expired gift (only sender can do this)
    function reclaimExpiredGift(bytes32 giftId) external {
        EscrowGift storage escrowGift = escrowGifts[giftId];
        
        require(escrowGift.amount > 0, "Gift does not exist");
        require(!escrowGift.claimed, "Gift already claimed");
        require(block.timestamp > escrowGift.expiresAt, "Gift has not expired");
        require(msg.sender == escrowGift.sender, "Not the gift sender");

        escrowGift.claimed = true; // Mark as claimed to prevent double spending
        payable(msg.sender).transfer(escrowGift.amount);

        emit EscrowGiftExpired(giftId, msg.sender, escrowGift.amount);
    }

    // View functions
    function getEscrowGift(bytes32 giftId) external view returns (EscrowGift memory) {
        return escrowGifts[giftId];
    }

    function getUserGifts(address user) external view returns (bytes32[] memory) {
        return userGifts[user];
    }

    function getSenderGifts(address sender) external view returns (bytes32[] memory) {
        return senderGifts[sender];
    }

    function isGiftClaimable(bytes32 giftId) external view returns (bool) {
        EscrowGift memory escrowGift = escrowGifts[giftId];
        return escrowGift.amount > 0 && !escrowGift.claimed && block.timestamp <= escrowGift.expiresAt;
    }
}
