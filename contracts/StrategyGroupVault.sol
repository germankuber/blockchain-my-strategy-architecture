//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./interfaces/IVault.sol";

contract StrategyGroupVault is IVault {
    function migrate(address migrationVaultMiultiSign) external override {}

    function approve(address _spender, uint256 _amount) external override {}
}
