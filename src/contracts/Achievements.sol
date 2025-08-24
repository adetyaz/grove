// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Grove.sol";

/**
 * @title Achievements - Fully Decentralized Gamification System
 * @notice Combined achievement logic and NFT minting with automatic tracking
 * @dev Integrates directly with Grove for real-time achievement detection - NO ADMIN CONTROL
 */
contract Achievements is ERC721URIStorage, AccessControl {
    Grove public grove;
    
    uint256 public nextTokenId = 1;
    
    // Achievement definitions
    struct AchievementType {
        string name;
        string description;
        string icon;
        uint256 threshold;
        string category; // "contribution", "social", "streak", "milestone"
        bool exists;
    }
    
    // User achievement tracking
    struct UserProgress {
        uint256 totalContributed;
        uint256 circlesJoined;
        uint256 invitesSent;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastContributionDay;
        uint256 consecutiveDays;
        mapping(uint256 => bool) hasAchievement;
        uint256[] unlockedAchievements;
    }
    
    mapping(uint256 => AchievementType) public achievementTypes;
    mapping(address => UserProgress) public userProgress;
    mapping(address => uint256[]) public userTokens;
    
    uint256 public totalAchievementTypes = 0;
    
    // Events
    event AchievementUnlocked(address indexed user, uint256 indexed achievementId, uint256 tokenId);
    event AchievementTypeCreated(uint256 indexed achievementId, string name, string category);
    event ProgressUpdated(address indexed user, string progressType, uint256 newValue);
    
    constructor(address _grove) ERC721("GroveAchievement", "GROVEACH") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grove = Grove(_grove);
        
        // Pre-register achievement types with ASCII icons
        _createAchievementType("First Steps", "Made your first contribution", "TARGET", 1, "milestone");
        _createAchievementType("Penny Saver", "Contributed 0.001 BTC total", "COIN", 0.001 ether, "contribution");
        _createAchievementType("Serious Saver", "Contributed 0.01 BTC total", "MONEY", 0.01 ether, "contribution");
        _createAchievementType("Big Spender", "Contributed 0.1 BTC total", "DIAMOND", 0.1 ether, "contribution");
        _createAchievementType("Goal Crusher", "Completed a savings circle", "TROPHY", 1, "milestone");
        _createAchievementType("Social Butterfly", "Invited 5 members to circles", "BUTTERFLY", 5, "social");
        _createAchievementType("Network Builder", "Invited 10 members to circles", "NETWORK", 10, "social");
        _createAchievementType("Community Leader", "Invited 25 members to circles", "CROWN", 25, "social");
        _createAchievementType("Streak Master", "Maintained 7-day contribution streak", "FIRE", 7, "streak");
        _createAchievementType("Consistency King", "Maintained 30-day contribution streak", "LIGHTNING", 30, "streak");
        _createAchievementType("Circle Explorer", "Joined 5 different circles", "COMPASS", 5, "social");
        _createAchievementType("Circle Veteran", "Joined 10 different circles", "MEDAL", 10, "social");
    }
    
    /**
     * @dev Override supportsInterface to handle both ERC721URIStorage and AccessControl
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override(ERC721URIStorage, AccessControl) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    // ============ ACHIEVEMENT TYPE MANAGEMENT ============
    
    /**
     * @dev Create new achievement type (internal only)
     */
    function _createAchievementType(
        string memory name,
        string memory description,
        string memory icon,
        uint256 threshold,
        string memory category
    ) internal {
        uint256 achievementId = totalAchievementTypes;
        
        achievementTypes[achievementId] = AchievementType({
            name: name,
            description: description,
            icon: icon,
            threshold: threshold,
            category: category,
            exists: true
        });
        
        totalAchievementTypes++;
        emit AchievementTypeCreated(achievementId, name, category);
    }
    
    // ============ PROGRESS TRACKING ============
    
    /**
     * @dev Update user progress and check achievements
     */
    function updateProgress(
        address user,
        uint256 contributionAmount,
        bool isNewCircle,
        bool isInvite
    ) external {
        require(msg.sender == address(grove), "Only Grove can update progress");
        
        UserProgress storage progress = userProgress[user];
        
        // Update contribution progress
        if (contributionAmount > 0) {
            progress.totalContributed += contributionAmount;
            _updateStreak(user);
            emit ProgressUpdated(user, "contribution", progress.totalContributed);
            
            // Check contribution-based achievements
            _checkContributionAchievements(user);
            _checkStreakAchievements(user);
        }
        
        // Update circle joining progress
        if (isNewCircle) {
            progress.circlesJoined++;
            emit ProgressUpdated(user, "circles", progress.circlesJoined);
            _checkSocialAchievements(user);
        }
        
        // Update invitation progress
        if (isInvite) {
            progress.invitesSent++;
            emit ProgressUpdated(user, "invites", progress.invitesSent);
            _checkSocialAchievements(user);
        }
    }
    
    /**
     * @dev Update contribution streak
     */
    function _updateStreak(address user) internal {
        UserProgress storage progress = userProgress[user];
        uint256 today = block.timestamp / 1 days;
        
        if (progress.lastContributionDay == 0) {
            // First contribution
            progress.currentStreak = 1;
            progress.consecutiveDays = 1;
        } else if (progress.lastContributionDay == today - 1) {
            // Consecutive day
            progress.currentStreak++;
            progress.consecutiveDays++;
        } else if (progress.lastContributionDay == today) {
            // Same day, no streak change
            return;
        } else {
            // Streak broken
            if (progress.currentStreak > progress.longestStreak) {
                progress.longestStreak = progress.currentStreak;
            }
            progress.currentStreak = 1;
            progress.consecutiveDays = 1;
        }
        
        progress.lastContributionDay = today;
        
        if (progress.currentStreak > progress.longestStreak) {
            progress.longestStreak = progress.currentStreak;
        }
    }
    
    // ============ ACHIEVEMENT CHECKING ============
    
    /**
     * @dev Check contribution-based achievements
     */
    function _checkContributionAchievements(address user) internal {
        UserProgress storage progress = userProgress[user];
        
        // First contribution (ID: 0)
        if (progress.totalContributed > 0 && !progress.hasAchievement[0]) {
            _mintAchievement(user, 0);
        }
        
        // Amount milestones (IDs: 1, 2, 3)
        uint256[] memory thresholds = new uint256[](3);
        thresholds[0] = 0.001 ether; // ID: 1
        thresholds[1] = 0.01 ether;  // ID: 2
        thresholds[2] = 0.1 ether;   // ID: 3
        
        for (uint i = 0; i < thresholds.length; i++) {
            uint256 achievementId = i + 1;
            if (progress.totalContributed >= thresholds[i] && !progress.hasAchievement[achievementId]) {
                _mintAchievement(user, achievementId);
            }
        }
    }
    
    /**
     * @dev Check streak-based achievements
     */
    function _checkStreakAchievements(address user) internal {
        UserProgress storage progress = userProgress[user];
        
        // 7-day streak (ID: 8)
        if (progress.currentStreak >= 7 && !progress.hasAchievement[8]) {
            _mintAchievement(user, 8);
        }
        
        // 30-day streak (ID: 9)
        if (progress.currentStreak >= 30 && !progress.hasAchievement[9]) {
            _mintAchievement(user, 9);
        }
    }
    
    /**
     * @dev Check social achievements
     */
    function _checkSocialAchievements(address user) internal {
        UserProgress storage progress = userProgress[user];
        
        // Invitation achievements (IDs: 5, 6, 7)
        uint256[] memory inviteThresholds = new uint256[](3);
        uint256[] memory inviteIds = new uint256[](3);
        inviteThresholds[0] = 5; inviteIds[0] = 5;   // Social Butterfly
        inviteThresholds[1] = 10; inviteIds[1] = 6;  // Network Builder
        inviteThresholds[2] = 25; inviteIds[2] = 7;  // Community Leader
        
        for (uint i = 0; i < inviteThresholds.length; i++) {
            if (progress.invitesSent >= inviteThresholds[i] && !progress.hasAchievement[inviteIds[i]]) {
                _mintAchievement(user, inviteIds[i]);
            }
        }
        
        // Circle joining achievements (IDs: 10, 11)
        uint256[] memory circleThresholds = new uint256[](2);
        uint256[] memory circleIds = new uint256[](2);
        circleThresholds[0] = 5; circleIds[0] = 10;  // Circle Explorer
        circleThresholds[1] = 10; circleIds[1] = 11; // Circle Veteran
        
        for (uint i = 0; i < circleThresholds.length; i++) {
            if (progress.circlesJoined >= circleThresholds[i] && !progress.hasAchievement[circleIds[i]]) {
                _mintAchievement(user, circleIds[i]);
            }
        }
    }
    
    /**
     * @dev Mint achievement NFT
     */
    function _mintAchievement(address user, uint256 achievementId) internal {
        require(achievementTypes[achievementId].exists, "Achievement type does not exist");
        require(!userProgress[user].hasAchievement[achievementId], "Already has achievement");
        
        uint256 tokenId = nextTokenId++;
        
        _mint(user, tokenId);
        _setTokenURI(tokenId, _generateTokenURI(achievementId));
        
        userProgress[user].hasAchievement[achievementId] = true;
        userProgress[user].unlockedAchievements.push(achievementId);
        userTokens[user].push(tokenId);
        
        emit AchievementUnlocked(user, achievementId, tokenId);
    }
    
    /**
     * @dev Generate token URI with metadata
     */
    function _generateTokenURI(uint256 achievementId) internal view returns (string memory) {
        AchievementType memory achievement = achievementTypes[achievementId];
        
        string memory json = string(abi.encodePacked(
            '{"name":"',
            achievement.name,
            '","description":"',
            achievement.description,
            '","image":"',
            _generateImageURI(achievementId),
            '","attributes":[',
            '{"trait_type":"Category","value":"',
            achievement.category,
            '"},',
            '{"trait_type":"Threshold","value":"',
            Strings.toString(achievement.threshold),
            '"},',
            '{"trait_type":"Achievement_ID","value":"',
            Strings.toString(achievementId),
            '"}]}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @dev Generate achievement image URI
     */
    function _generateImageURI(uint256 achievementId) internal view returns (string memory) {
        AchievementType memory achievement = achievementTypes[achievementId];
        
        // Create SVG with achievement icon and colors
        string memory color = _getAchievementColor(achievement.category);
        string memory displayIcon = _getDisplayIcon(achievement.icon);
        
        string memory svg = string(abi.encodePacked(
            '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">',
            '<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:',
            color,
            ';stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:#000;stop-opacity:0.3" />',
            '</linearGradient></defs>',
            '<circle cx="100" cy="100" r="90" fill="url(#grad)" stroke="#fff" stroke-width="4"/>',
            '<text x="100" y="120" font-family="Arial" font-size="20" fill="white" text-anchor="middle" font-weight="bold">',
            displayIcon,
            '</text>',
            '</svg>'
        ));
        
        return string(abi.encodePacked(
            "data:image/svg+xml;base64,",
            _base64Encode(bytes(svg))
        ));
    }
    
    /**
     * @dev Convert ASCII icon names to display text
     */
    function _getDisplayIcon(string memory iconName) internal pure returns (string memory) {
        bytes32 iconHash = keccak256(abi.encodePacked(iconName));
        
        if (iconHash == keccak256("TARGET")) return "TARGET";
        if (iconHash == keccak256("COIN")) return "COIN";
        if (iconHash == keccak256("MONEY")) return "MONEY";
        if (iconHash == keccak256("DIAMOND")) return "DIAMOND";
        if (iconHash == keccak256("TROPHY")) return "TROPHY";
        if (iconHash == keccak256("BUTTERFLY")) return "SOCIAL";
        if (iconHash == keccak256("NETWORK")) return "NETWORK";
        if (iconHash == keccak256("CROWN")) return "LEADER";
        if (iconHash == keccak256("FIRE")) return "STREAK";
        if (iconHash == keccak256("LIGHTNING")) return "POWER";
        if (iconHash == keccak256("COMPASS")) return "EXPLORE";
        if (iconHash == keccak256("MEDAL")) return "VETERAN";
        
        return iconName; // Default fallback
    }
    
    /**
     * @dev Get color based on achievement category
     */
    function _getAchievementColor(string memory category) internal pure returns (string memory) {
        bytes32 categoryHash = keccak256(abi.encodePacked(category));
        
        if (categoryHash == keccak256("contribution")) return "#10B981"; // Green
        if (categoryHash == keccak256("social")) return "#8B5CF6";       // Purple
        if (categoryHash == keccak256("streak")) return "#F59E0B";       // Orange
        if (categoryHash == keccak256("milestone")) return "#EF4444";    // Red
        
        return "#6B7280"; // Default gray
    }
    
    // ============ PUBLIC FUNCTIONS ============
    
    /**
     * @dev Claim achievement if eligible (public function)
     */
    function claimAchievement(uint256 achievementId) external {
        require(achievementTypes[achievementId].exists, "Achievement does not exist");
        require(!userProgress[msg.sender].hasAchievement[achievementId], "Already has achievement");
        require(_isEligibleForAchievement(msg.sender, achievementId), "Not eligible for achievement");
        
        _mintAchievement(msg.sender, achievementId);
    }
    
    /**
     * @dev Check if user is eligible for achievement
     */
    function _isEligibleForAchievement(address user, uint256 achievementId) internal view returns (bool) {
        UserProgress storage progress = userProgress[user];
        AchievementType memory achievement = achievementTypes[achievementId];
        
        bytes32 categoryHash = keccak256(abi.encodePacked(achievement.category));
        
        if (categoryHash == keccak256("contribution")) {
            return progress.totalContributed >= achievement.threshold;
        }
        if (categoryHash == keccak256("social")) {
            if (achievementId >= 10) { // Circle joining achievements
                return progress.circlesJoined >= achievement.threshold;
            } else { // Invitation achievements
                return progress.invitesSent >= achievement.threshold;
            }
        }
        if (categoryHash == keccak256("streak")) {
            return progress.longestStreak >= achievement.threshold;
        }
        if (categoryHash == keccak256("milestone")) {
            if (achievementId == 0) return progress.totalContributed > 0;
            // Add other milestone checks as needed
        }
        
        return false;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's achievements
     */
    function getUserAchievements(address user) external view returns (uint256[] memory) {
        return userProgress[user].unlockedAchievements;
    }
    
    /**
     * @dev Get user's progress
     */
    function getUserProgress(address user) external view returns (
        uint256 totalContributed,
        uint256 circlesJoined,
        uint256 invitesSent,
        uint256 currentStreak,
        uint256 longestStreak,
        uint256 achievementCount
    ) {
        UserProgress storage progress = userProgress[user];
        return (
            progress.totalContributed,
            progress.circlesJoined,
            progress.invitesSent,
            progress.currentStreak,
            progress.longestStreak,
            progress.unlockedAchievements.length
        );
    }
    
    /**
     * @dev Check if user has specific achievement
     */
    function hasAchievement(address user, uint256 achievementId) external view returns (bool) {
        return userProgress[user].hasAchievement[achievementId];
    }
    
    /**
     * @dev Get achievement type info
     */
    function getAchievementType(uint256 achievementId) external view returns (
        string memory name,
        string memory description,
        string memory icon,
        uint256 threshold,
        string memory category
    ) {
        AchievementType memory achievement = achievementTypes[achievementId];
        return (
            achievement.name,
            achievement.description,
            achievement.icon,
            achievement.threshold,
            achievement.category
        );
    }
    
    /**
     * @dev Get user's NFT tokens
     */
    function getUserTokens(address user) external view returns (uint256[] memory) {
        return userTokens[user];
    }
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * @dev Base64 encoding function
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen + 32);
        
        assembly {
            let tablePtr := add(table, 1)
            let dataPtr := data
            let endPtr := add(dataPtr, mload(data))
            let resultPtr := add(result, 32)
            
            for {} lt(dataPtr, endPtr) {}
            {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)
                
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr( 6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(        input,  0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            
            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
            
            mstore(result, encodedLen)
        }
        
        return result;
    }
}
