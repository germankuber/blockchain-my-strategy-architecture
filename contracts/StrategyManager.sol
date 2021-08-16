//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./interfaces/IStrategy.sol";
import "./interfaces/ICollector.sol";
import "./interfaces/IVault.sol";
import "./interfaces/IHarvestStrategy.sol";

import "./StrategyGroupVault.sol";

contract StrategyManager {
    struct StrategyGroup {
        IStrategy[] strategies;
        IHarvestStrategy harvestStrategy;
        ICollector collector;
        IVault vault;
        bool exist;
    }

    mapping(string => IVault) vaults;

    IVault[] vaultsList;

    mapping(string => StrategyGroup) public strategiesGroup;

    mapping(string => IStrategy) public farmStrategies;
    string[] farmStrategiesList;

    mapping(string => IHarvestStrategy) public harvestStrategies;
    string[] harvestStrategiesList;

    mapping(string => ICollector) public collectors;
    string[] collectorsList;

    function addFarmStrategy(
        string calldata _farmStrategyName,
        IStrategy _strategy
    ) external {
        require(
            address(farmStrategies[_farmStrategyName]) == address(0),
            "Already exist a farm strategy with that name"
        );
        require(_strategy.isStrategy(), "The address is not a IStrategy");
        farmStrategies[_farmStrategyName] = _strategy;
        farmStrategiesList.push(_farmStrategyName);
    }

    function addHarvestStrategy(
        string calldata _harvestStrategyName,
        IHarvestStrategy _strategy
    ) external {
        require(
            address(harvestStrategies[_harvestStrategyName]) == address(0),
            "Already exist a Harvest strategy with that name"
        );
        require(
            _strategy.isHarvestStrategy(),
            "The address is not a IHarvestStrategy"
        );
        harvestStrategies[_harvestStrategyName] = _strategy;
        harvestStrategiesList.push(_harvestStrategyName);
    }

    function createStrategyGroup(
        string calldata _strategyName,
        string[] calldata _farmStrategies,
        string calldata _harvestStrategy,
        ICollector collector
    ) external {
        require(
            !strategiesGroup[_strategyName].exist,
            "Already exist a strategy with that name"
        );
        require(
            address(harvestStrategies[_harvestStrategy]) != address(0),
            "There is address that is not a IHarvestStrategy"
        );

        require(
            collector.isCollector(),
            "The address of collector is not a ICollector"
        );

        StrategyGroup memory newGroup = StrategyGroup(
            _checkIfAreStrategies(_farmStrategies),
            harvestStrategies[_harvestStrategy],
            collector,
            _createVault(_strategyName),
            true
        );
        strategiesGroup[_strategyName] = newGroup;
    }

    function _createVault(string calldata _strategyName)
        private
        returns (StrategyGroupVault)
    {
        StrategyGroupVault vault = new StrategyGroupVault();
        vaults[_strategyName] = vault;
        vaultsList.push(vault);
        return vault;
    }

    function _checkIfAreStrategies(string[] calldata strategies)
        private
        view
        returns (IStrategy[] memory)
    {
        IStrategy[] memory strategiesToReturn = new IStrategy[](
            strategies.length
        );
        for (uint256 i = 0; i < strategies.length; i++) {
            IStrategy strategy = farmStrategies[strategies[i]];
            require(
                address(strategy) != address(0),
                "There is address that is not a IStrategy"
            );
            strategiesToReturn[i] = strategy;
        }
        return strategiesToReturn;
    }
}
