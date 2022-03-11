pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./ReleaseFund.sol";

contract Treasury{
    ReleaseFund[] public releaseFunds;
    address public releaseFundMasterContract;


    constructor(address _releaseFundMasterContract) {
        releaseFundMasterContract = _releaseFundMasterContract;
    }

    function createChild() public {
        ReleaseFund rFund = ReleaseFund(Clones.clone(releaseFundMasterContract));
        //rFund.init();
        releaseFunds.push(rFund);
    }
}