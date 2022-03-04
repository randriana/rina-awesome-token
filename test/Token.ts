import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Token } from "../typechain";

const tokenName = "Rina Super Coin";
const tokenSymbol = "RISC";

describe("Token", function () {
  let token: Token;
  let owner: SignerWithAddress;
  let beneficiary: SignerWithAddress;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    [owner, beneficiary] = await ethers.getSigners();

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
    await token.mint(beneficiary.address, ethers.utils.parseEther("1"));
    const balance = await token.balanceOf(beneficiary.address);
    expect(ethers.utils.formatEther(balance)).to.equal("1.0");
  });
});
