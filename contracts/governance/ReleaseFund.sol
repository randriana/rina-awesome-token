pragma solidity ^0.8.0;

import "./GovernanceToken.sol";
import "../Token.sol";

contract ReleaseFund {
    uint256 public govTokenSnapshopId;
    uint256 public releasedAmount;
    uint256 public refundTime;
    address public parentTreasury;

    GovernanceToken public govToken;
    Token public token;

    mapping(address => bool) public hasWithdrawnFunds;

    event FundWithdrawn(address receiver, uint256 amount);
    event RefundRemaining(uint256 remainingAmount);
    event ReleaseFundInitialised(uint256 amount, uint256 snapshotId, uint256 refundTime);

    function init(uint256 _govTokenSnapshopId, GovernanceToken _govToken, Token _token, uint256 _refundTime) external {
        require(_token.balanceOf(address(this)) > 0, "Has not received funds yet");

        releasedAmount = _token.balanceOf(address(this));
        govTokenSnapshopId = _govTokenSnapshopId;
        govToken = _govToken;
        token = _token;
        refundTime = _refundTime;
        parentTreasury = msg.sender;

        emit ReleaseFundInitialised(releasedAmount, govTokenSnapshopId, refundTime);
    }

    function withdraw() external {
        address receiver = msg.sender;

        require(hasWithdrawnFunds[receiver] == false, "Has already withdrawn funds");
        require(token.balanceOf(address(this)) > 0, "Fund balance is 0");

        uint256 shareAmount = shareAmountFor(receiver);

        require(token.balanceOf(address(this)) > shareAmount, "User share amount surpasses fund balance");

        hasWithdrawnFunds[receiver] = true;

        token.transfer(receiver, shareAmount);
        emit FundWithdrawn(receiver, shareAmount);
    }

    function refundRemaining() external {
        require(block.number > refundTime, "Refund time not reached");
        require(token.balanceOf(address(this)) > 0, "Nothing more to refund");

        uint256 remainingBalance = token.balanceOf(address(this));
        token.transfer(parentTreasury, remainingBalance);
        
        emit RefundRemaining(remainingBalance);
    }

    function checkHasWithdrawnFund(address account) external view returns (bool) {
        return hasWithdrawnFunds[account];
    }

    function remainingAmount() external view returns (uint256) {
        return govToken.balanceOf(address(this));
    }

    function shareAmountFor(address account) public view returns (uint256) {
        uint256 receiverGovBalance = govToken.balanceOfAt(account, govTokenSnapshopId);        
        uint256 totalGovSupply = govToken.totalSupplyAt(govTokenSnapshopId);        

        return _calculateReleaseShareAmount(receiverGovBalance, totalGovSupply);
    }

    function _calculateReleaseShareAmount(uint256 balance, uint256 totalSupply) private view returns (uint256) {
        uint256 share = balance * 1e18 / totalSupply;
        return share * releasedAmount / 1e18;
    }
}