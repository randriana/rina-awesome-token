import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { fromEther, toEther } from "../utils/format";
import { Token, GovernanceToken, ReleaseFund } from "../../typechain";

describe("ReleaseFund", function () {
  let owner: SignerWithAddress;
  let hordeAccount: SignerWithAddress;
  let withdrawer: SignerWithAddress;
  let governanceToken: GovernanceToken;
  let token: Token;

  const TOTAL_TOKEN_AMOUNT = 1_000_000;
  const TOTAL_GOV_TOKEN_AMOUNT = 100_000;
  const WITHDRAWER_GOV_SHARE = 0.1;
  const RELEASE_FUND_BALANCE = 750_000;

  before(async () => {
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    const Token = await ethers.getContractFactory("Token");
    [owner, hordeAccount, withdrawer] = await ethers.getSigners();

    token = <Token>(
      await Token.deploy("MyToken", "MT", fromEther(TOTAL_TOKEN_AMOUNT))
    );
    governanceToken = <GovernanceToken>(
      await GovernanceToken.deploy(fromEther(TOTAL_GOV_TOKEN_AMOUNT))
    );
    await token.deployed();
    await governanceToken.deployed();

    // Give away half of gov tokens
    await (
      await governanceToken.transfer(
        withdrawer.address,
        fromEther(TOTAL_GOV_TOKEN_AMOUNT * WITHDRAWER_GOV_SHARE)
      )
    ).wait();
  });

  it("Snapshot, deploy, withdraw, refundRemaining", async function () {
    await (await governanceToken.snapshot()).wait();

    const snapshotId = await governanceToken.getCurrentSnapshotId();
    const blockNumber = await ethers.provider.getBlockNumber();

    const ReleaseFund = await ethers.getContractFactory(
      "ReleaseFund",
      withdrawer
    );

    const releaseFund = <ReleaseFund>await ReleaseFund.deploy();

    await releaseFund.deployed();

    await token.transfer(releaseFund.address, fromEther(RELEASE_FUND_BALANCE));

    await (
      await releaseFund.init(
        snapshotId,
        governanceToken.address,
        token.address,
        blockNumber,
        blockNumber
      )
    ).wait();

    expect(await token.balanceOf(releaseFund.address)).to.equal(
      fromEther(RELEASE_FUND_BALANCE)
    );

    await releaseFund.withdraw();

    expect(await token.balanceOf(releaseFund.address)).to.equal(
      fromEther(
        RELEASE_FUND_BALANCE - RELEASE_FUND_BALANCE * WITHDRAWER_GOV_SHARE
      )
    );

    expect(await token.balanceOf(withdrawer.address)).to.equal(
      fromEther(RELEASE_FUND_BALANCE * WITHDRAWER_GOV_SHARE)
    );

    await expect(releaseFund.withdraw()).to.be.revertedWith(
      "Has already withdrawn funds"
    );

    const { events } = await (await releaseFund.refundRemaining()).wait();

    expect(events).to.satisfy((x: Array<Object>) =>
      x.find((e: any) => e.event === "RefundRemaining")
    );

    expect(await token.balanceOf(releaseFund.address)).to.equal(0);
    expect(await token.balanceOf(withdrawer.address)).to.equal(
      fromEther(RELEASE_FUND_BALANCE)
    );
  });
});
