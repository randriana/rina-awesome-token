// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

contract RinaAwesomeToken is ERC20 {
    constructor() ERC20("Rina Awesome Token", "RAT") {        
        _mint(msg.sender, 1000 ether);
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}