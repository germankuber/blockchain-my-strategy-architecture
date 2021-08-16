//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IHarvestStrategy {
    function isHarvestStrategy() external pure returns (bool);
}
