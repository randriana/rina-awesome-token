import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { fromEther, toEther } from "./utils/format";

const DAIaddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const SwapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const Quoter = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

describe("Swap", function () {
  let swap;
  let dai: Contract;
  // eslint-disable-next-line no-unused-vars
  let owner: SignerWithAddress;

  before(async () => {
    [owner] = await ethers.getSigners();

    const Swap = await ethers.getContractFactory("Swap", owner);

    const Token = await ethers.getContractFactory("Token");
    dai = await Token.attach(DAIaddress);

    swap = await Swap.deploy(SwapRouter, Quoter);

    await swap.deployed();

    const tx = await swap.swapETH({
      value: fromEther(0.1).toString(),
    });

    await tx.wait();
  });

  it("owner should receive correct amount of DAI", async function () {
    const daiBalance = await dai.balanceOf(owner.address);
    expect(Number(toEther(daiBalance))).to.be.closeTo(295, 0.2);
  });
});
