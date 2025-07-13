// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InheritanceModule
 * @notice Handles inheritance and beneficiary logic for Grove circles
 */
/**
 * @dev This contract is now chain-agnostic: it only stores beneficiary data and emits events.
 *      Actual asset transfers must be handled by SatVault or a cross-chain module (e.g., Hyperlane).
 */
contract InheritanceModule {
    struct Beneficiary {
        address beneficiary;
        uint256 share; // percentage (out of 10000)
    }

    // circleId => owner => beneficiaries
    mapping(uint256 => mapping(address => Beneficiary[])) public circleBeneficiaries;

    event BeneficiarySet(uint256 indexed circleId, address indexed owner, address indexed beneficiary, uint256 share);
    // For future cross-chain/citrea/Hyperlane integration, keep event for off-chain indexers
    event InheritanceClaimed(uint256 indexed circleId, address indexed beneficiary, uint256 amount);


    function setBeneficiaries(uint256 circleId, Beneficiary[] calldata beneficiaries) external {
        require(beneficiaries.length > 0, "No beneficiaries");
        uint256 totalShare = 0;
        // Enforce unique beneficiaries
        for (uint i = 0; i < beneficiaries.length; i++) {
            for (uint j = i + 1; j < beneficiaries.length; j++) {
                require(beneficiaries[i].beneficiary != beneficiaries[j].beneficiary, "Duplicate beneficiary");
            }
        }
        delete circleBeneficiaries[circleId][msg.sender];
        for (uint i = 0; i < beneficiaries.length; i++) {
            require(beneficiaries[i].beneficiary != address(0), "Zero address");
            require(beneficiaries[i].share > 0, "Zero share");
            totalShare += beneficiaries[i].share;
            circleBeneficiaries[circleId][msg.sender].push(beneficiaries[i]);
            emit BeneficiarySet(circleId, msg.sender, beneficiaries[i].beneficiary, beneficiaries[i].share);
        }
        require(totalShare == 10000, "Total share must be 10000");
    }

    // No direct payout logic: SatVault or a cross-chain module must handle asset transfers.
    // This contract is ready for integration with Hyperlane or Citrea-native modules.
}
