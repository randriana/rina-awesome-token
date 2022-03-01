// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const Contract = await ethers.getContractFactory("AssetOracle");
  const contract = await Contract.attach(
    "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"
  );

  const tx = await contract.updateBankBalance(12);
  console.log(tx);
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
