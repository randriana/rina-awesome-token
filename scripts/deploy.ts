// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { Crowdsale, Token } from "../typechain";
const SwapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

async function main() {
  const [acc2] = await ethers.getSigners();

  // We get the contract to deploy
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("Rina Super Coin", "RISC");

  console.log("Token deployed to:", token.address);

  const Swap = await ethers.getContractFactory("Swap");
  const swap = await Swap.deploy(SwapRouter);

  const Crowdsale = await ethers.getContractFactory("Crowdsale");
  const crowdsale = await Crowdsale.deploy(
    acc2.address,
    token.address,
    ethers.utils.parseEther("1"),
    swap.address
  );

  await crowdsale.deployed();

  console.log("Crowdsale deployed to:", crowdsale.address);

  await token.grantRole(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
    crowdsale.address
  );

  console.log("Token MINTER_ROLE granted to:", crowdsale.address);

  const [owner] = await ethers.getSigners();

  await crowdsale.grantRole(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MAINTAINER_ROLE")),
    owner.address
  );

  console.log("Crowdsale MAINTAINER_ROLE granted to:", owner.address);

  //await testSwap(crowdsale, token);
}

const testSwap = async (crowdsale: Crowdsale, token: Token) => {
  const [account] = await ethers.getSigners();
  const TOKEN = await ethers.getContractFactory("Token");
  const dai = await TOKEN.attach("0x6B175474E89094C44Da98b954EedeAC495271d0F");

  const preBalance = await dai.balanceOf(account.address);

  console.log("DAI balance before", ethers.utils.formatEther(preBalance));
  const tx = await crowdsale.buyTokens(account.address, {
    value: ethers.utils.parseEther("0.01"),
  });
  await tx.wait();
  const postBalance = await dai.balanceOf(account.address);

  console.log("DAI balance after", ethers.utils.formatEther(postBalance));
};

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
