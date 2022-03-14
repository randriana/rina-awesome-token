import { expect } from "chai";
import { ethers, getNamedAccounts, deployments } from "hardhat";
import { fromEther } from "../utils/format";
import { Token, Treasury } from "../../typechain";
import { TREASURY_BALANCE } from "../../helper-hardhat-config";

describe("Treasury", function () {
  let token: Token;
  let treasury: Treasury;

  const RELEASE_AMOUNT = 100_000;

  before(async () => {
    const { admin } = await getNamedAccounts();

    await deployments.fixture();
    treasury = await ethers.getContract("Treasury", admin);
    token = await ethers.getContract("Token", admin);

    await token.transfer(treasury.address, fromEther(TREASURY_BALANCE));
  });

  describe("Release", async function () {
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

  describe("Donation", async function () {
    it("Should donate", async function () {
      const AMOUNT = 100;
      const accounts = await ethers.getSigners();
      await treasury.donate(accounts[2].address, fromEther(AMOUNT));
      expect(await token.balanceOf(accounts[2].address)).to.equal(
        fromEther(AMOUNT)
      );
    });
    it("should set max donation amount", async function () {
      await (await treasury.setMaxDonationAmount(fromEther(100))).wait();
    });
    it("Should throw error: <Amount exceeded limit>", async function () {
      const DONATION_AMOUNT = 100_000;
      const accounts = await ethers.getSigners();
      await expect(
        treasury.donate(accounts[2].address, fromEther(DONATION_AMOUNT))
      ).to.be.revertedWith("Amount exceeded limit");
    });

    it("Should throw error: <Amount exceeded balance>", async function () {
      const accounts = await ethers.getSigners();
      await (
        await treasury.setMaxDonationAmount(fromEther(100_000_000))
      ).wait();
      await expect(
        treasury.donate(accounts[2].address, fromEther(100_000_000))
      ).to.be.revertedWith("Amount exceeded balance");
    });
  });
});
