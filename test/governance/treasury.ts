import { expect } from "chai";
import { ethers } from "hardhat";
import { fromEther } from "../utils/format";
import { Token, GovernanceToken, ReleaseFund, Treasury } from "../../typechain";

describe("Treasury", function () {
  let governanceToken: GovernanceToken;
  let token: Token;
  let releaseFundMaster: ReleaseFund;
  let treasury: Treasury;

  const TOTAL_TOKEN_AMOUNT = 1_000_000;
  const TOTAL_GOV_TOKEN_AMOUNT = 100_000;
  const TREASURY_BALANCE = 750_000;
  const RELEASE_AMOUNT = 100_000;

  before(async () => {
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    const ReleaseFundMaster = await ethers.getContractFactory("ReleaseFund");
    const Token = await ethers.getContractFactory("Token");
    const Treasury = await ethers.getContractFactory("Treasury");

    token = <Token>(
      await Token.deploy("Token", "TK", fromEther(TOTAL_TOKEN_AMOUNT))
    );
    governanceToken = <GovernanceToken>(
      await GovernanceToken.deploy(fromEther(TOTAL_GOV_TOKEN_AMOUNT))
    );
    releaseFundMaster = <ReleaseFund>await ReleaseFundMaster.deploy();
    await token.deployed();
    await governanceToken.deployed();
    await releaseFundMaster.deployed();

    const currentBlockNumber = await ethers.provider.getBlockNumber();

    treasury = <Treasury>(
      await Treasury.deploy(
        releaseFundMaster.address,
        governanceToken.address,
        token.address,
        currentBlockNumber + 1,
        0,
        fromEther(100_000)
      )
    );

    await token.transfer(treasury.address, fromEther(TREASURY_BALANCE));
  });

  it("Should release", async function () {
    await treasury.release(fromEther(RELEASE_AMOUNT));

    const releaseFundAddress =
      await treasury.getCurrentReleaseFundContractAddress();

    expect(await token.balanceOf(releaseFundAddress)).to.equal(
      fromEther(RELEASE_AMOUNT)
    );
    expect(await token.balanceOf(treasury.address)).to.equal(
      fromEther(TREASURY_BALANCE - RELEASE_AMOUNT)
    );
  });

  it("should set max release amount", async function () {
    await (await treasury.setMaxReleaseAmount(fromEther(100))).wait();
  });

  it("Should throw error: <Amount exceeded limit>", async function () {
    await expect(
      treasury.release(fromEther(RELEASE_AMOUNT))
    ).to.be.revertedWith("Amount exceeded limit");
  });

  it("Should throw error: <Amount exceeded balance>", async function () {
    await (await treasury.setMaxReleaseAmount(fromEther(100_000_000))).wait();
    await expect(treasury.release(fromEther(100_000_000))).to.be.revertedWith(
      "Amount exceeded balance"
    );
  });
});
