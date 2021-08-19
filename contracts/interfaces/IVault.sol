//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IVault {
    function migrate(address _migrationVaultMiultiSign) external;

    function approve(address _spender, uint256 _amount) external;
}
