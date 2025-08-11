// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AchievementNFT
 * @notice ERC721 for Grove achievements that matches frontend expectations
 * @dev This contract is designed to work with the existing Grove/SatVault system
 */
contract AchievementNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    
    // Mapping from user address to array of achievement IDs they own
    mapping(address => uint256[]) public userAchievements;
    
    // Mapping from user address to achievement ID to whether they have it
    mapping(address => mapping(uint256 => bool)) public hasUserAchievement;
    
    // Mapping from achievement ID to token URI
    mapping(uint256 => string) public achievementURIs;
    
    // Achievement metadata
    struct AchievementMetadata {
        string name;
        string description;
        string icon;
        bool exists;
    }
    
    mapping(uint256 => AchievementMetadata) public achievements;

    event AchievementMinted(address indexed to, uint256 indexed achievementId, uint256 indexed tokenId);
    event AchievementRegistered(uint256 indexed achievementId, string name, string description);

    constructor() ERC721("GroveAchievement", "GROVEACH") Ownable(msg.sender) {
        nextTokenId = 1; // Start token IDs from 1 instead of 0
        
        // Pre-register the 6 achievement types expected by frontend
        _registerAchievement(0, "First Steps", "Made your first contribution to a savings circle", "FIRST");
        _registerAchievement(1, "Penny Saver", "Contributed 0.001 BTC total", "PENNY");
        _registerAchievement(2, "Serious Saver", "Contributed 0.01 BTC total", "SAVER");
        _registerAchievement(3, "Goal Crusher", "Completed a savings circle goal", "GOAL");
        _registerAchievement(4, "Consistency King", "Maintained a 7-day contribution streak", "STREAK");
        _registerAchievement(5, "Circle Builder", "Invited 5 or more members to circles", "SOCIAL");
    }

    /**
     * @dev Register a new achievement type (owner only)
     */
    function _registerAchievement(
        uint256 achievementId,
        string memory name,
        string memory description,
        string memory icon
    ) internal {
        achievements[achievementId] = AchievementMetadata({
            name: name,
            description: description,
            icon: icon,
            exists: true
        });
        
        // Set default token URI
        achievementURIs[achievementId] = string(abi.encodePacked(
            "data:application/json;base64,",
            _encodeAchievementMetadata(achievementId, name, description, icon)
        ));
        
        emit AchievementRegistered(achievementId, name, description);
    }

    /**
     * @dev Mint achievement to user (owner only) - matches frontend expectations
     */
    function mintAchievement(address to, uint256 achievementId) external onlyOwner {
        require(achievements[achievementId].exists, "Achievement does not exist");
        require(!hasUserAchievement[to][achievementId], "User already has this achievement");
        
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, achievementURIs[achievementId]);
        
        // Track achievement for user
        userAchievements[to].push(achievementId);
        hasUserAchievement[to][achievementId] = true;
        
        emit AchievementMinted(to, achievementId, tokenId);
    }

    /**
     * @dev Check if user has specific achievement - matches frontend expectations
     */
    function hasAchievement(address user, uint256 achievementId) external view returns (bool) {
        return hasUserAchievement[user][achievementId];
    }

    /**
     * @dev Get all achievement IDs for user - matches frontend expectations
     */
    function getUserAchievements(address user) external view returns (uint256[] memory) {
        return userAchievements[user];
    }

    /**
     * @dev Get achievement metadata
     */
    function getAchievementMetadata(uint256 achievementId) external view returns (
        string memory name,
        string memory description,
        string memory icon,
        bool exists
    ) {
        AchievementMetadata memory achievement = achievements[achievementId];
        return (achievement.name, achievement.description, achievement.icon, achievement.exists);
    }

    /**
     * @dev Update token URI for achievement type (owner only)
     */
    function updateAchievementURI(uint256 achievementId, string memory newURI) external onlyOwner {
        require(achievements[achievementId].exists, "Achievement does not exist");
        achievementURIs[achievementId] = newURI;
    }

    /**
     * @dev Helper function to encode achievement metadata as base64 JSON
     */
    function _encodeAchievementMetadata(
        uint256 achievementId,
        string memory name,
        string memory description,
        string memory /* icon */
    ) internal pure returns (string memory) {
        // Create proper NFT metadata with image URIs
        string memory imageUri = _getAchievementImageUri(achievementId);
        
        return string(abi.encodePacked(
            '{"name":"', name, 
            '","description":"', description,
            '","image":"', imageUri,
            '","attributes":[{"trait_type":"Category","value":"Grove Achievement"},{"trait_type":"Achievement_ID","value":"', _toString(achievementId), '"}]}'
        ));
    }

    /**
     * @dev Get image URI for achievement
     */
    function _getAchievementImageUri(uint256 achievementId) internal pure returns (string memory) {
        if (achievementId == 0) {
            return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2M2IzZWQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Rmlyc3Q8L3RleHQ+PC9zdmc+";
        } else if (achievementId == 1) {
            return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZGJhNzQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmNzkyMWEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGVubnk8L3RleHQ+PC9zdmc+";
        } else if (achievementId == 2) {
            return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQwMTciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZjg5MDMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2F2ZXI8L3RleHQ+PC9zdmc+";
        } else if (achievementId == 3) {
            return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNlZjQ0NDQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNkYzI2MjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R29hbDwvdGV4dD48L3N2Zz4=";
        } else if (achievementId == 4) {
            return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOTczMTYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlYTU4MGMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3RyZWFrPC90ZXh0Pjwvc3ZnPg==";
        } else if (achievementId == 5) {
            return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNhZTU1ZjciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM5MzM0ZWEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U29jaWFsPC90ZXh0Pjwvc3ZnPg==";
        }
        
        // Default fallback
        return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzZiNzI4MCIvPjx0ZXh0IHg9IjUwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Qm9udXM8L3RleHQ+PC9zdmc+";
    }

    /**
     * @dev Public function to allow users to claim achievements
     * This allows users to self-mint achievements they've earned
     */
    function claimAchievement(uint256 achievementId) external {
        require(achievements[achievementId].exists, "Achievement does not exist");
        require(!hasUserAchievement[msg.sender][achievementId], "User already has this achievement");
        
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, achievementURIs[achievementId]);
        
        // Track achievement for user
        userAchievements[msg.sender].push(achievementId);
        hasUserAchievement[msg.sender][achievementId] = true;
        
        emit AchievementMinted(msg.sender, achievementId, tokenId);
    }

    /**
     * @dev Convert uint256 to string using OpenZeppelin's Strings library
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        return Strings.toString(value);
    }
}
