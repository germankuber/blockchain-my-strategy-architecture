//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./interfaces/IStrategy.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract BaseStrategy is IStrategy {
    function isStrategy() external pure override returns (bool) {
        return true;
    }

    function execute(
        string calldata _strategyName,
        uint256 _amount,
        IVault _vault
    ) external virtual override returns (uint256) {}
}
