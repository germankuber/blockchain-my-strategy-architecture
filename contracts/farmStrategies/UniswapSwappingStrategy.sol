//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "../interfaces/IStrategy.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract UniswapSwappingStrategy is IStrategy {
    event ExecutedUniswapSwappingStrategy(
        string strategyGroupname,
        IERC20 tokenFromSwap,
        uint256 amountBeforeSwap,
        IERC20 tokenToSwap,
        uint256 amountAfterSwap
    );

    using SafeERC20 for IERC20;
    struct StrategyConfiguration {
        IERC20 tokenFromSwap;
        IERC20 tokenToSwap;
    }
    IUniswapV2Router02 uniRouter;
    mapping(string => StrategyConfiguration) public configuration;

    constructor(IUniswapV2Router02 _uniRouter) {
        uniRouter = _uniRouter;
    }

    function isStrategy() external pure override returns (bool) {
        return true;
    }

    function execute(
        string calldata _strategyGroupName,
        uint256 _amount,
        IVault _vault
    ) external virtual override returns (uint256) {
        require(
            address(configuration[_strategyGroupName].tokenFromSwap) !=
                address(0),
            "The strategy group does not exist"
        );
        StrategyConfiguration memory config = configuration[_strategyGroupName];

        config.tokenFromSwap.approve(address(uniRouter), _amount);

        address[] memory path = new address[](2);
        path[0] = address(config.tokenFromSwap);
        path[1] = address(config.tokenToSwap);
        uint256[] memory result = uniRouter.swapExactTokensForTokens(
            _amount,
            0,
            path,
            address(_vault),
            block.timestamp + 120
        );
        emit ExecutedUniswapSwappingStrategy(
            _strategyGroupName,
            config.tokenFromSwap,
            _amount,
            config.tokenToSwap,
            result[0]
        );
        return result[0];
    }

    function configure(
        string calldata _strategyGroupName,
        IERC20 _tokenFromSwap,
        IERC20 _tokenToSwap
    ) external {
        require(
            address(configuration[_strategyGroupName].tokenFromSwap) ==
                address(0),
            "The strategy group name already exist"
        );
        //TODO: has to test, if the address are not 0
        require(
            address(_tokenFromSwap) != address(0),
            "Token from swap can not be a 0 address"
        );
        require(
            address(_tokenToSwap) != address(0),
            "Token to swap can not be a 0 address"
        );
        StrategyConfiguration memory config = StrategyConfiguration(
            _tokenFromSwap,
            _tokenToSwap
        );
        configuration[_strategyGroupName] = config;
    }
}
