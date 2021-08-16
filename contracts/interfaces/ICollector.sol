//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface ICollector {
    function collect() external;

    function isCollector() external returns (bool);
}
