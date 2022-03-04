pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "./IWETH9.sol";

contract Swap {
    ISwapRouter public immutable swapRouter;
    IQuoter public immutable quoter;
    address beneficiary;
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    uint24 public constant poolFee = 3000;

    constructor(ISwapRouter _swapRouter, IQuoter _quoter) {
        swapRouter = _swapRouter;
        quoter = _quoter;
    }

    function swapETH() external payable returns (uint256) {                
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: DAI,
                fee: poolFee,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: msg.value,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        return swapRouter.exactInputSingle{ value: msg.value}(params);
    }

    function estimateSwap(uint256 amount) external returns (uint256) {
        address tokenIn = WETH9;
        address tokenOut = DAI;
        uint24 fee = 3000;
        uint160 sqrtPriceLimitX96 = 0;

        return quoter.quoteExactInputSingle(tokenIn, tokenOut, fee, amount, sqrtPriceLimitX96);
    }
}