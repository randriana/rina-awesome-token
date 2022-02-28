// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const accounts = await ethers.getSigners();

  // We get the contract to deploy
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("Rina Super Coin", "RISC");

  console.log("Token deployed to:", token.address);

  const AssetOracle = await ethers.getContractFactory("AssetOracle");
  const oracle = await AssetOracle.deploy(10);

  console.log("Oracle deployed to:", oracle.address);

  const Crowdsale = await ethers.getContractFactory("Crowdsale");
  const crowdsale = await Crowdsale.deploy(
    accounts[1].address,
    token.address,
    oracle.address
  );

  await crowdsale.deployed();

  console.log("Crowdsale deployed to:", crowdsale.address);
}

/*
 *Token deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
 *Crowdsale deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
 */

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
