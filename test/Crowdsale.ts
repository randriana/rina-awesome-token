import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { fromEther, toEther } from "./utils/format";
import { resetTokenBalance } from "./utils/utils";

const tokenName = "Rina Super Coin";
const tokenSymbol = "RISC";
const SwapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const Quoter = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
const DAIaddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

describe("Crowdsale", () => {
  let token: Contract;
  let dai: Contract;
  let crowdsale: Contract;
  let swap;
  let owner: SignerWithAddress;
  let buyer: SignerWithAddress;
  let treasury: SignerWithAddress;

  before(async () => {
    const Token = await ethers.getContractFactory("Token");
    const Crowdsale = await ethers.getContractFactory("Crowdsale");
    const Swap = await ethers.getContractFactory("Swap");
    [owner, buyer, treasury] = await ethers.getSigners();

    swap = await Swap.deploy(SwapRouter, Quoter);
    token = await Token.deploy(tokenName, tokenSymbol);
    crowdsale = await Crowdsale.deploy(
      treasury.address,
      token.address,
      ethers.constants.WeiPerEther,
      swap.address
    );
    dai = await Token.attach(DAIaddress);
  });

  describe("Deployment", () => {
    it("Should have correct rate", async () => {
      expect(await crowdsale.getRate()).to.equal(fromEther(1));
    });
    it("Should have correct token", async () => {
      expect(await crowdsale.token()).to.equal(token.address);
    });
    it("Should have correct treasury wallet", async () => {
      expect(await crowdsale.wallet()).to.equal(treasury.address);
    });
  });

  describe("Minting", () => {
    before(async () => {
      await token.grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
        crowdsale.address
      );
      await crowdsale.buyTokens(buyer.address, {
        value: fromEther(1).toString(),
      });
    });

    it("Buyer should receive correct amount of tokens", async () => {
      const balance = await token.balanceOf(buyer.address);
      expect(Number(toEther(balance))).to.be.closeTo(2951, 0.8);
    });

    it("Treasury should receive correct amount of ether", async () => {
      const daiBalance = await dai.balanceOf(treasury.address);
      expect(Number(toEther(daiBalance))).to.be.closeTo(2951, 0.8);
    });
  });

  describe("Rate", () => {
    before(async () => {
      await token.grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
        crowdsale.address
      );
      await crowdsale.grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MAINTAINER_ROLE")),
        owner.address
      );
      await resetTokenBalance(buyer, token.address);
    });

    it("Should set new rate", async () => {
      expect(await crowdsale.getRate()).to.equal(fromEther(1));

      await crowdsale.setRate(10);

      expect(await crowdsale.getRate()).to.equal(10);
    });

    it("Should mint correct number of tokens with new rate", async () => {
      await crowdsale.setRate(fromEther(3.14));

      await crowdsale.buyTokens(buyer.address, {
        value: fromEther(1).toString(),
      });

      const balance = await token.balanceOf(buyer.address);
      expect(Number(toEther(balance))).to.be.closeTo(9268, 0.4);
    });
  });
});
