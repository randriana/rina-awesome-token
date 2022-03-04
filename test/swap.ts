import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Token, Swap } from "../typechain";
import { fromEther, toEther } from "./utils/format";

const DAIaddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const SwapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

describe("Swap", function () {
  let swap: Swap;
  let buyer: SignerWithAddress;
  let dai: Token;
  // eslint-disable-next-line no-unused-vars
  let owner: SignerWithAddress;

  before(async () => {
    [owner, buyer] = await ethers.getSigners();

    const Swap = await ethers.getContractFactory("Swap", buyer);

    const Token = await ethers.getContractFactory("Token");
    dai = await Token.attach(DAIaddress);

    swap = await Swap.deploy(SwapRouter);

    await swap.deployed();

    const tx = await swap.swapETH({
      value: fromEther(0.1).toString(),
    });

    await tx.wait();
  });

  it("owner should receive correct amount of RISC", async function () {
    const daiBalance = await dai.balanceOf(buyer.address);
    expect(Number(toEther(daiBalance))).to.be.gt(600);
  });
});
