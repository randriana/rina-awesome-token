import { expect } from "chai";
import { ethers, deployments, getNamedAccounts } from "hardhat";
import { fromEther } from "../utils/format";
import { Token, GovernanceToken, ReleaseFund } from "../../typechain";
import {
  MOCK_USER_GOV_SHARE,
  RELEASE_FUND_BALANCE,
  TOTAL_GOV_TOKEN_AMOUNT,
} from "../../helper-hardhat-config";

describe("ReleaseFund", function () {
  let governanceToken: GovernanceToken;
  let token: Token;
  let releaseFund: ReleaseFund;
  let admin: string;
  let mockUser: string;

  before(async () => {
    const namedAccounts = await getNamedAccounts();
    admin = namedAccounts.admin;
    mockUser = namedAccounts.mockUser;

    await deployments.fixture();
    releaseFund = await ethers.getContract("ReleaseFund", admin);
    governanceToken = await ethers.getContract("GovernanceToken", admin);
    token = await ethers.getContract("Token", admin);

    await (
      await governanceToken.transfer(
        mockUser,
        fromEther(TOTAL_GOV_TOKEN_AMOUNT * MOCK_USER_GOV_SHARE)
      )
    ).wait();
  });

  describe("Initialization", () => {
    it("Initialize", async () => {
      const res = await (await governanceToken.snapshot()).wait();
      const snapshotId = Number(res.events![0].args![0]);
      const blockNumber = await ethers.provider.getBlockNumber();

      await token.transfer(
        releaseFund.address,
        fromEther(RELEASE_FUND_BALANCE)
      );

      await (
        await releaseFund.init(
          snapshotId,
          governanceToken.address,
          token.address,
          blockNumber,
          blockNumber
        )
      ).wait();
    });
    it("should have correct balance", async () => {
      expect(await token.balanceOf(releaseFund.address)).to.equal(
        fromEther(RELEASE_FUND_BALANCE)
      );
    });
  });

  describe("Withdraw", async () => {
    it("should withdraw", async () => {
      const signers = await ethers.getSigners();
      await (await releaseFund.connect(signers[2])).withdraw();
    });
    it("should have correct fund balance", async () => {
      expect(await token.balanceOf(releaseFund.address)).to.equal(
        fromEther(
          RELEASE_FUND_BALANCE - RELEASE_FUND_BALANCE * MOCK_USER_GOV_SHARE
        )
      );
    });
    it("should have correct user balance", async () => {
      expect(await token.balanceOf(mockUser)).to.equal(
        fromEther(RELEASE_FUND_BALANCE * MOCK_USER_GOV_SHARE)
      );
    });

    it("should throw error: <Has already withdrawn funds>", async () => {
      const signers = await ethers.getSigners();
      const releasefundTemp = await releaseFund.connect(signers[2]);

      await expect(releasefundTemp.withdraw()).to.be.revertedWith(
        "Has already withdrawn funds"
      );
    });
    it("should refund remaining amount", async () => {
      const { events } = await (await releaseFund.refundRemaining()).wait();
      expect(events).to.satisfy((x: Array<Object>) =>
        x.find((e: any) => e.event === "RefundRemaining")
      );
    });

    it("should have correct fund balance", async function () {
      expect(await token.balanceOf(releaseFund.address)).to.equal(0);
    });
  });
});
