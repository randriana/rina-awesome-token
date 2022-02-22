import { expect } from "chai";
import { ethers } from "hardhat";
import { Crowdsale, RinaAwesomeToken } from "../typechain";

describe("Rina Awesome Token", function () {
  let token: RinaAwesomeToken;
  let owner: { address: string };
  const treasuryAccount = {
    address: "0x14701438d1e2A4BE2578158D26F027ea4e99dA6c",
  };

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("RinaAwesomeToken");
    [owner] = await ethers.getSigners();

    token = await Token.deploy();
  });

  it("Should get correct initial parameters", async function () {
    await token.deployed();

    expect(await token.name()).to.equal("Rina Awesome Token");
    expect(await token.symbol()).to.equal("RAT");
    expect(await token.decimals()).to.equal(18);
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
  let token: RinaAwesomeToken;
  let crowdsale: Crowdsale;
  let owner: { address: string };
  const treasuryAccount = {
    address: "0x14701438d1e2A4BE2578158D26F027ea4e99dA6c",
  };
  const crowdsaleRate = 1;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("RinaAwesomeToken");
    const Crowdsale = await ethers.getContractFactory("Crowdsale");
    [owner] = await ethers.getSigners();

    token = await Token.deploy();
    crowdsale = await Crowdsale.deploy(
      crowdsaleRate,
      treasuryAccount.address,
      token.address
    );
  });

  describe("Deployment", () => {
    it("Should have correct rate", async () => {
      expect(await crowdsale.rate()).to.equal(crowdsaleRate);
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
      await crowdsale.buyTokens(owner.address, { value: 99 });
      expect(await token.balanceOf(owner.address)).to.equal(99);
    });

    it("Treasury should receive correct amount of ether", async () => {
      expect(
        await ethers.provider.getBalance(treasuryAccount.address)
      ).to.equal(99);
    });
  });
});
