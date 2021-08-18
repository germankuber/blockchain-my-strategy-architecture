//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./IVault.sol";

interface IStrategy {
    function isStrategy() external pure returns (bool);

    function execute(
        string calldata _strategyName,
        uint256 _amount,
        IVault _vault
    ) external;
}
