// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract AssetOracle {
    uint256 private _bankBalance;

    constructor(uint256 initialBankBalance) {
        _bankBalance = initialBankBalance;
    } 

    function getBankBalance() public view returns (uint256) {
        return _bankBalance;
    }

    function updateBankBalance(uint256 newBalance) external {
        _bankBalance = newBalance;
    }
}