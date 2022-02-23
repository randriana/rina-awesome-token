// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract AssetOracle {
    int private _bankBalance;

    constructor(int initialBankBalance) {
        _bankBalance = initialBankBalance;
    } 

    function getBankBalance() public view returns (int) {
        return _bankBalance;
    }

    function updateBankBalance(int newBalance) public {
        _bankBalance = newBalance;
    }
}