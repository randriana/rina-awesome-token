pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GovernanceToken.sol";
import "../Token.sol";
import "./ReleaseFund.sol";

contract Treasury is Ownable {
    ReleaseFund[] public releaseFunds;
    address public releaseFundMasterContract;
    Token public token;
    GovernanceToken public governanceToken;
    uint256 public refundTime;
    uint256 public withdrawDelay;
    uint256 public currentSnapshotId;
    address public currentReleaseFundContractAddress;
    uint256 public maxReleaseAmount;

    event Release(uint256 amount, uint256 snapshotId, uint256 refundTime, uint256 withdrawDelay, address releaseFundContractAddress);

    constructor(address _releaseFundMasterContract, GovernanceToken _governanceToken, Token _token, uint256 _refundTime, uint256 _withdrawDelay, uint256 _maxReleaseAmout) {
        releaseFundMasterContract = _releaseFundMasterContract;
        token = _token;
        governanceToken = _governanceToken;
        refundTime = _refundTime;
        withdrawDelay = _withdrawDelay;
        currentSnapshotId = 0;
        currentReleaseFundContractAddress = address(0);
        maxReleaseAmount = _maxReleaseAmout;
    }

    function release(uint256 amount) external onlyOwner() {
        require(amount <= maxReleaseAmount, "Amount exceeded limit");
        require(token.balanceOf(address(this)) >= amount, "Amount exceeded balance");

        uint256 snapshotId = governanceToken.snapshot();        
        uint256 withdrawAllowedAt = block.number + withdrawDelay;

        address cloneAddress = Clones.cloneDeterministic(releaseFundMasterContract, bytes32(snapshotId));

        ReleaseFund rFund = ReleaseFund(cloneAddress);

        token.transfer(cloneAddress, amount);

        rFund.init(snapshotId, governanceToken, token, refundTime, withdrawAllowedAt);
        releaseFunds.push(rFund);

        currentSnapshotId = snapshotId;
        currentReleaseFundContractAddress = cloneAddress;

        emit Release(amount, snapshotId, refundTime, withdrawDelay, cloneAddress);
    }

    function setRefundTime(uint256 _refundTime) external onlyOwner() {
        refundTime = _refundTime;
    }

    function setWithdrawDelay(uint256 _withdrawDelay) external onlyOwner() {
        withdrawDelay = _withdrawDelay;
    }
    
    function setMaxReleaseAmount(uint256 _maxReleaseAmount) external onlyOwner() {
        maxReleaseAmount = _maxReleaseAmount;
    }

    function getReleaseFundContractAddress(uint256 snapshopId) public view returns(address) {
        return Clones.predictDeterministicAddress(releaseFundMasterContract, bytes32(snapshopId));
    }

    function getCurrentReleaseFundContractAddress() external view returns(address) {
        return currentReleaseFundContractAddress;
    }
}