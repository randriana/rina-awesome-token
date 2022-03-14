import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

export const resetTokenBalance = async (
  signer: SignerWithAddress,
  tokenAddress: string
) => {
  const Token = await ethers.getContractFactory("Token", signer);
  const token = await Token.attach(tokenAddress);

  const randomReceiver = ethers.Wallet.createRandom();

  const balance = await token.balanceOf(signer.address);
  const tx = await token.transfer(randomReceiver.address, balance);
  await tx.wait();
};

export const transferTotalBalance = async (
  from: SignerWithAddress,
  to: string,
  tokenAddress: string
) => {
  const token = await ethers.getContractAt("Token", tokenAddress, from);
  const balance = await token.balanceOf(from.address);
  const tx = await token.transfer(to, balance);
  await tx.wait();
};
