import { expect } from "chai";
import { ethers } from "hardhat";

describe("Rina Awesome Token", function () {
  it("Should get correct initial parameters", async function () {
    const Token = await ethers.getContractFactory("RinaAwesomeToken");
    const token = await Token.deploy();
    await token.deployed();

    expect(await token.name()).to.equal("Rina Awesome Token");
    expect(await token.symbol()).to.equal("RAT");
    expect(await token.decimals()).to.equal(18);
  });
});
