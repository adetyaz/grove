// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Grove.sol";

interface IAchievementNFT {
    function mintAchievement(address to, uint256 achievementId) external;
    function hasAchievement(address user, uint256 achievementId) external view returns (bool);
    function getUserAchievements(address user) external view returns (uint256[] memory);
}

/**
 * @title GroveAchievements
 * @notice Extension contract to add achievements to existing Grove without breaking SatVault integration
 * @dev This contract wraps the existing Grove contract and adds achievement functionality
 */
contract GroveAchievements {
    Grove public immutable grove;
    IAchievementNFT public achievementNFT;
    address public admin;
    
    // Track user contribution totals for achievements
    mapping(address => uint256) public userTotalContributions;
    mapping(address => uint256) public userCircleCount;
    mapping(address => uint256) public userInviteCount;
    
    event AchievementAwarded(address indexed user, uint256 indexed achievementId);
    event ContributionTracked(address indexed user, uint256 amount, uint256 total);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _grove, address _achievementNFT) {
        grove = Grove(_grove);
        achievementNFT = IAchievementNFT(_achievementNFT);
        admin = msg.sender;
    }

    /**
     * @dev Track contribution and check achievements
     * Call this after contributing through Grove contract
     */
    function trackContribution(address user, uint256 amount) external {
        // Only allow Grove contract or admin to call this
        require(msg.sender == address(grove) || msg.sender == admin, "Unauthorized");
        
        userTotalContributions[user] += amount;
        emit ContributionTracked(user, amount, userTotalContributions[user]);
        
        _checkAchievements(user, amount);
    }

    /**
     * @dev Manually track contribution for existing users (admin only)
     */
    function manualTrackContribution(address user, uint256 amount) external onlyAdmin {
        userTotalContributions[user] += amount;
        emit ContributionTracked(user, amount, userTotalContributions[user]);
        _checkAchievements(user, amount);
    }

    /**
     * @dev Track circle membership (call when user joins circle)
     */
    function trackCircleMembership(address user) external onlyAdmin {
        userCircleCount[user]++;
    }

    /**
     * @dev Track invitations (call when user invites someone)
     */
    function trackInvitation(address inviter) external onlyAdmin {
        userInviteCount[inviter]++;
        
        // Check social butterfly achievement (5+ invites)
        if (userInviteCount[inviter] >= 5 && !achievementNFT.hasAchievement(inviter, 5)) {
            achievementNFT.mintAchievement(inviter, 5);
            emit AchievementAwarded(inviter, 5);
        }
    }

    /**
     * @dev Get user stats compatible with frontend expectations
     */
    function getUserStats(address user) external view returns (
        uint256 totalContributed,
        uint256 circleCount,
        uint256[] memory achievements
    ) {
        totalContributed = userTotalContributions[user];
        circleCount = userCircleCount[user];
        achievements = achievementNFT.getUserAchievements(user);
    }

    /**
     * @dev Internal function to check and award achievements
     */
    function _checkAchievements(address user, uint256 contributionAmount) internal {
        uint256 totalContributed = userTotalContributions[user];
        
        // First contribution achievement (ID: 0)
        if (totalContributed == contributionAmount && !achievementNFT.hasAchievement(user, 0)) {
            achievementNFT.mintAchievement(user, 0);
            emit AchievementAwarded(user, 0);
        }
        
        // 0.001 BTC milestone (ID: 1) - assuming 18 decimals like ETH
        if (totalContributed >= 0.001 ether && !achievementNFT.hasAchievement(user, 1)) {
            achievementNFT.mintAchievement(user, 1);
            emit AchievementAwarded(user, 1);
        }
        
        // 0.01 BTC milestone (ID: 2)
        if (totalContributed >= 0.01 ether && !achievementNFT.hasAchievement(user, 2)) {
            achievementNFT.mintAchievement(user, 2);
            emit AchievementAwarded(user, 2);
        }
    }

    /**
     * @dev Award achievement manually (admin only)
     */
    function awardAchievement(address user, uint256 achievementId) external onlyAdmin {
        require(!achievementNFT.hasAchievement(user, achievementId), "User already has achievement");
        achievementNFT.mintAchievement(user, achievementId);
        emit AchievementAwarded(user, achievementId);
    }

    /**
     * @dev Claim achievement if user has earned it (public function)
     * Anyone can call this to mint achievements they've earned
     */
    function claimAchievement(uint256 achievementId) external {
        address user = msg.sender;
        require(!achievementNFT.hasAchievement(user, achievementId), "User already has achievement");
        require(_hasEarnedAchievement(user, achievementId), "Achievement not earned");
        
        achievementNFT.mintAchievement(user, achievementId);
        emit AchievementAwarded(user, achievementId);
    }

    /**
     * @dev Check if user has earned a specific achievement
     */
    function _hasEarnedAchievement(address user, uint256 achievementId) internal view returns (bool) {
        uint256 totalContributed = userTotalContributions[user];
        
        if (achievementId == 0) {
            // First contribution - if they have any contributions
            return totalContributed > 0;
        } else if (achievementId == 1) {
            // 0.001 BTC milestone
            return totalContributed >= 0.001 ether;
        } else if (achievementId == 2) {
            // 0.01 BTC milestone
            return totalContributed >= 0.01 ether;
        } else if (achievementId == 3) {
            // Circle completed - for now, just check if they have circles
            return userCircleCount[user] > 0;
        } else if (achievementId == 4) {
            // Streak achievement - simplified check
            return userCircleCount[user] >= 1;
        } else if (achievementId == 5) {
            // Social butterfly - 5+ invites
            return userInviteCount[user] >= 5;
        }
        
        return false;
    }

    /**
     * @dev Public function to check if user has earned an achievement
     */
    function hasEarnedAchievement(address user, uint256 achievementId) external view returns (bool) {
        return _hasEarnedAchievement(user, achievementId);
    }

    /**
     * @dev Update achievement contract (admin only)
     */
    function updateAchievementNFT(address newAchievementNFT) external onlyAdmin {
        achievementNFT = IAchievementNFT(newAchievementNFT);
    }

    /**
     * @dev Batch track existing users' contributions from on-chain data
     */
    function batchTrackContributions(
        address[] calldata users,
        uint256[] calldata amounts
    ) external onlyAdmin {
        require(users.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            userTotalContributions[users[i]] = amounts[i];
            emit ContributionTracked(users[i], amounts[i], amounts[i]);
            _checkAchievements(users[i], amounts[i]);
        }
    }
}
