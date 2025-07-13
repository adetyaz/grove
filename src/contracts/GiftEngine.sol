// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GiftEngine
 * @notice Handles gifting between circle members
 */
contract GiftEngine {
    event Gifted(uint256 indexed circleId, address indexed from, address indexed to, uint256 amount, string message);

    // Called by Grove or SatVault for gifting
    function gift(uint256 circleId, address to, string calldata message) external payable {
        require(msg.value > 0, "No gift amount");
        payable(to).transfer(msg.value);
        emit Gifted(circleId, msg.sender, to, msg.value, message);
    }
}
