pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./IWETH9.sol";

import "hardhat/console.sol";

contract Swap {
    ISwapRouter public immutable swapRouter;
    IQuoter public immutable quoter;
    address beneficiary;
    address public immutable WETH9;

    uint24 public poolFee;

    constructor(
        ISwapRouter _swapRouter,
        IQuoter _quoter,
        address _weth9,
        uint24 _poolFee
    ) {
        swapRouter = _swapRouter;
        quoter = _quoter;
        WETH9 = _weth9;
        poolFee = _poolFee;
    }

    function swapETH(address toToken) external payable returns (uint256) {
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: toToken,
                fee: poolFee,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: msg.value,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        return swapRouter.exactInputSingle{value: msg.value}(params);
    }

    function estimateETHSwap(uint256 amount, address toToken)
        external
        returns (uint256)
    {
        address tokenIn = WETH9;
        address tokenOut = toToken;
        uint24 fee = 3000;
        uint160 sqrtPriceLimitX96 = 0;

        return
            quoter.quoteExactInputSingle(
                tokenIn,
                tokenOut,
                fee,
                amount,
                sqrtPriceLimitX96
            );
    }
}
