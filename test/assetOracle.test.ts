import { expect } from "chai";
import { ethers } from "hardhat";
import { AssetOracle } from "../typechain";

describe("AssetOracle", function () {
  let oracle: AssetOracle;

  beforeEach(async () => {
    const Oracle = await ethers.getContractFactory("AssetOracle");
    oracle = await Oracle.deploy(100);
  });

  it("Should get correct initial parameters", async function () {
    await oracle.deployed();

    expect(await oracle.getBankBalance()).to.equal(100);
  });

  it("Should be able to update bank balance", async () => {
    await oracle.updateBankBalance(1234);
    expect(await oracle.getBankBalance()).to.equal(1234);
  });
});
