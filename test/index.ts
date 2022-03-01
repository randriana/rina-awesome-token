import { expect } from "chai";
import { ethers } from "hardhat";
import { Crowdsale, Token } from "../typechain";

const tokenName = "Rina Super Coin";
const tokenSymbol = "RISC";

describe("Token", function () {
  let token: Token;
  let owner: { address: string };
  const treasuryAccount = {
    address: "0x14701438d1e2A4BE2578158D26F027ea4e99dA6c",
  };

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    [owner] = await ethers.getSigners();

    token = await Token.deploy(tokenName, tokenSymbol);
  });

  it("Should get correct initial parameters", async function () {
    await token.deployed();

    expect(await token.name()).to.equal(tokenName);
    expect(await token.symbol()).to.equal(tokenSymbol);
    expect(await token.decimals()).to.equal(18);
    expect(await token.totalSupply()).to.equal(ethers.utils.parseEther("1"));
  });

  it("Should mint correct amount to beneficiary", async () => {
    await token.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
      owner.address
    );
    await token.mint(treasuryAccount.address, 1000);
    expect(await token.balanceOf(treasuryAccount.address)).to.equal(1000);
  });
});

describe("Crowdsale", () => {
  let token: Token;
  let crowdsale: Crowdsale;
  let owner: { address: string };
  let acc2: { address: string };
  const treasuryAccount = {
    address: "0x14701438d1e2A4BE2578158D26F027ea4e99dA6c",
  };

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    const Crowdsale = await ethers.getContractFactory("Crowdsale");
    [owner, acc2] = await ethers.getSigners();

    token = await Token.deploy(tokenName, tokenSymbol);
    crowdsale = await Crowdsale.deploy(
      treasuryAccount.address,
      token.address,
      ethers.utils.parseEther("1")
    );
  });

  describe("Deployment", () => {
    it("Should have correct rate", async () => {
      expect(await crowdsale.getRate()).to.equal(ethers.utils.parseEther("1"));
    });
    it("Should have correct token", async () => {
      expect(await crowdsale.token()).to.equal(token.address);
    });
    it("Should have correct wallet", async () => {
      expect(await crowdsale.wallet()).to.equal(treasuryAccount.address);
    });
  });

  describe("Minting", () => {
    beforeEach(async () => {
      await token.grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
        crowdsale.address
      );
    });

    it("Owner should receive correct amount of tokens", async () => {
      await crowdsale.buyTokens(owner.address, {
        value: ethers.utils.parseEther("1").toString(),
      });
      expect(await token.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("2").toString()
      );
    });

    it("Treasury should receive correct amount of ether", async () => {
      expect(
        await ethers.provider.getBalance(treasuryAccount.address)
      ).to.equal(ethers.utils.parseEther("1"));
    });
  });

  describe("Rate", () => {
    beforeEach(async () => {
      await crowdsale.grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MAINTAINER_ROLE")),
        owner.address
      );
    });

    it("Should set new rate", async () => {
      await crowdsale.grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MAINTAINER_ROLE")),
        owner.address
      );

      expect(await crowdsale.getRate()).to.equal(ethers.utils.parseEther("1"));

      await crowdsale.setRate(10);

      expect(await crowdsale.getRate()).to.equal(10);
    });

    it("Should mint correct number of tokens with new rate", async () => {
      await crowdsale.setRate(ethers.utils.parseEther(`3.14`));

      await token.grantRole(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
        crowdsale.address
      );

      await crowdsale.buyTokens(acc2.address, {
        value: ethers.utils.parseEther("1").toString(),
      });

      const weiBalance = await token.balanceOf(acc2.address);

      expect(ethers.utils.formatEther(weiBalance)).to.equal("3.14");
    });
  });
});
