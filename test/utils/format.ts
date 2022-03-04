import { BigNumberish } from "ethers";
import { ethers } from "hardhat";

export function toEther(weiValue: BigNumberish): string {
  return ethers.utils.formatEther(weiValue);
}

export function fromEther(etherValue: number): BigNumberish {
  return ethers.utils.parseEther(etherValue.toString());
}
