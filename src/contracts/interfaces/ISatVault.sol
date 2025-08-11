// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISatVault
 * @notice Interface for SatVault integration with InheritanceModule
 */
interface ISatVault {
    function getMemberContributions(uint256 circleId, address member) external view returns (uint256);
    function withdrawInheritance(uint256 circleId, address deceased, address beneficiary, uint256 amount) external;
}
