// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AchievementNFT
 * @notice ERC721 for Grove achievements and gamification
 */
contract AchievementNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(address => uint256[]) public achievementsByUser;

    event AchievementMinted(address indexed to, uint256 indexed tokenId, string achievementId);

    constructor() ERC721("GroveAchievement", "GROVEACH") Ownable(msg.sender) {}

    function mintAchievement(address to, string memory achievementId, string memory tokenURI) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        achievementsByUser[to].push(tokenId);
        emit AchievementMinted(to, tokenId, achievementId);
    }
}
