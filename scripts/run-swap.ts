// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

const SwapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

async function main() {
  const [acc] = await ethers.getSigners();
  const Swap = await ethers.getContractFactory("Swap", acc);
  const swap = await Swap.deploy(SwapRouter);

  const tx = await swap.swapETH({
    value: ethers.utils.parseEther("1"),
  });

  await tx.wait();
  console.log("success!");
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
