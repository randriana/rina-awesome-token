import { expect } from "chai";
import { ethers, getNamedAccounts, deployments } from "hardhat";
import { Token, Crowdsale } from "../typechain";
import { fromEther, toEther } from "./utils/format";

const DAIaddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

describe("Crowdsale", () => {
  let token: Token;
  let crowdsale: Crowdsale;
  let dai: Token;

  before(async () => {
    const { admin } = await getNamedAccounts();

    await deployments.fixture();

    token = await ethers.getContract("Token", admin);
    crowdsale = await ethers.getContract("Crowdsale", admin);
    dai = await ethers.getContractAt("Token", DAIaddress);
  });

  describe("Deployment", () => {
    it("Should have correct rate", async () => {
      expect(await crowdsale.getRate()).to.equal(fromEther(1));
    });
    it("Should have correct token", async () => {
      expect(await crowdsale.token()).to.equal(token.address);
    });
    it("Should have correct wallet", async () => {
      const { horde } = await getNamedAccounts();
      expect(await crowdsale.wallet()).to.equal(horde);
    });
  });

  describe("Minting", () => {
    before(async () => {
      const signers = await ethers.getSigners();

      crowdsale = await crowdsale.connect(signers[2]);

      await crowdsale.buyTokensWithETH({
        value: fromEther(0.338868).toString(),
      });
    });

    it("Buyer should receive correct amount of tokens", async () => {
      const { mockUser } = await getNamedAccounts();
      const balance = await token.balanceOf(mockUser);
      expect(Number(toEther(balance))).to.be.closeTo(970, 0.3);
    });

    it("Treasury should receive correct amount of ether", async () => {
      const { horde } = await getNamedAccounts();
      const daiBalance = await dai.balanceOf(horde);
      expect(Number(toEther(daiBalance))).to.be.closeTo(1395, 0.3);
    });
  });

  describe("Rate", () => {
    before(async () => {
      // Use admin as signer
      const signers = await ethers.getSigners();
      crowdsale = await crowdsale.connect(signers[0]);
    });

    it("Should set new rate", async () => {
      expect(await crowdsale.getRate()).to.equal(fromEther(1));

      await crowdsale.setRate(10);

      expect(await crowdsale.getRate()).to.equal(10);
    });

    it("Should mint correct number of tokens with new rate", async () => {
      const signers = await ethers.getSigners();
      const { mockUser } = await getNamedAccounts();
      await crowdsale.setRate(fromEther(3.14));

      // Use mockUser as signer
      crowdsale = await crowdsale.connect(signers[2]);

      await crowdsale.buyTokensWithETH({
        value: fromEther(1).toString(),
      });

      const balance = await token.balanceOf(mockUser);
      expect(Number(toEther(balance))).to.be.closeTo(9960, 0.4);
    });
  });
});
