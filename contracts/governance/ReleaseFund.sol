pragma solidity ^0.8.0;

import "./GovernanceToken.sol";

contract ReleaseFund {
    uint256 public govTokenSnapshopId;
    uint256 public releasedAmount;
    uint256 public refundTime;
    address public parentTreasury;

    GovernanceToken public govToken;
    mapping(address => bool) public hasWithdrawnFunds;

    event FundWithdrawn(address receiver, uint256 amount);
    event RefundRemaining(uint256 remainingAmount);
    event ReleaseFundInitialised(uint256 amount, uint256 snapshotId, uint256 refundTime);

    function init(uint256 _govTokenSnapshopId, GovernanceToken _govToken, uint256 _refundTime) external {
        require(_govToken.balanceOf(address(this)) > 0, "Has not received funds yet");

        releasedAmount = _govToken.balanceOf(address(this));
        govTokenSnapshopId = _govTokenSnapshopId;
        govToken = _govToken;
        refundTime = _refundTime;
        parentTreasury = msg.sender;

        emit ReleaseFundInitialised(releasedAmount, govTokenSnapshopId, refundTime);
    }

    function withdraw() external {
        address receiver = msg.sender;
        uint256 receiverBalance = govToken.balanceOfAt(receiver, govTokenSnapshopId);

        require(hasWithdrawnFunds[receiver] = false, "Has already withdrawn funds");
        require(govToken.balanceOf(address(this)) > 0, "Fund balance is 0");
        require(govToken.balanceOf(address(this)) > receiverBalance, "User balance surpasses fund balance");

        uint256 releaseShareAmount = shareAmountFor(receiver);
        hasWithdrawnFunds[receiver] = true;

        govToken.transfer(receiver, releaseShareAmount);
        emit FundWithdrawn(receiver, releaseShareAmount);
    }

    function refundRemaining() external {
        require(block.number > refundTime, "Refund time not reached");
        uint256 remainingBalance = govToken.balanceOf(address(this));
        govToken.transfer(parentTreasury, remainingBalance);
        
        emit RefundRemaining(remainingBalance);
    }

    function checkHasWithdrawnFund(address account) external view returns (bool) {
        return hasWithdrawnFunds[account];
    }

    function remainingAmount() external view returns (uint256) {
        return govToken.balanceOf(address(this));
    }

    function shareAmountFor(address account) public view returns (uint256) {
        uint256 receiverBalance = govToken.balanceOfAt(account, govTokenSnapshopId);
        uint256 totalSupply = govToken.totalSupplyAt(govTokenSnapshopId);
        return _calculateReleaseShareAmount(receiverBalance, totalSupply);
    }

    function _calculateReleaseShareAmount(uint256 balance, uint256 totalSupply) private view returns (uint256) {        
        return balance / totalSupply * releasedAmount;
    }
}