import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { getExternalContract } from "../utils/helpers";
import { fromEther, toEther } from "./utils/format";
import { SWAP_POOL_FEE } from "../helper-hardhat-config";

describe("Swap", function () {
  let swap;
  let dai: Contract;
  // eslint-disable-next-line no-unused-vars
  let owner: SignerWithAddress;

  before(async () => {
    [owner] = await ethers.getSigners();

    const Swap = await ethers.getContractFactory("Swap", owner);

    const Token = await ethers.getContractFactory("Token");

    const daiAddress = getExternalContract("DAI", "hardhat");
    const swapRouterAddress = getExternalContract("SwapRouter", "hardhat");
    const quoterAddress = getExternalContract("Quoter", "hardhat");
    const usdcAddress = getExternalContract("USDC", "hardhat");
    const weth9Address = getExternalContract("WETH9", "hardhat");

    dai = await Token.attach(daiAddress!);

    swap = await Swap.deploy(
      swapRouterAddress,
      quoterAddress,
      daiAddress,
      usdcAddress,
      weth9Address,
      SWAP_POOL_FEE
    );

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
