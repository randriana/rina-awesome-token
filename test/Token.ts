import { expect } from "chai";
import { ethers, deployments, getNamedAccounts } from "hardhat";
import { Token } from "../typechain";
import { fromEther, toEther } from "./utils/format";

const tokenName = "Token";
const tokenSymbol = "TK";

describe("Token", function () {
  let token: Token;

  beforeEach(async () => {
    const { admin } = await getNamedAccounts();

    await deployments.fixture(["Token"]);
    token = await ethers.getContract("Token", admin);
  });

  it("Should get correct initial parameters", async function () {
    await token.deployed();

    expect(await token.name()).to.equal(tokenName);
    expect(await token.symbol()).to.equal(tokenSymbol);
    expect(await token.decimals()).to.equal(18);
    expect(await token.totalSupply()).to.equal(ethers.utils.parseEther("1"));
  });

  it("Should mint correct amount to beneficiary", async () => {
    const { admin, mockUser } = await getNamedAccounts();

    await token.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
      admin
    );
    await token.mint(mockUser, fromEther(1));
    const balance = await token.balanceOf(mockUser);
    expect(toEther(balance)).to.equal("1.0");
  });
});
