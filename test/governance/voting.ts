import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { GovernanceToken } from "../../typechain/GovernanceToken.d";
import { toEther } from "../utils/format";
import { moveBlocks } from "../../utils/move-blocks";

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }) => {
    await deployments.fixture();
    const { deployer } = await getNamedAccounts();
    const governanceToken: GovernanceToken = await ethers.getContract(
      "GovernanceToken",
      deployer
    );
    const timelock = ethers.getContract("Timelock", deployer);
    const governorContract = ethers.getContract("GovernorContract", deployer);

    return {
      deployer,
      governanceToken,
      timelock,
      governorContract,
    };
  }
);

describe("Voting process", function () {
  it("Should be able to propose", async () => {
    const { deployer, governanceToken } = await setupTest();
    await governanceToken.delegate(deployer);

    // const encodedFunctionCall = box.interface.encodeFunctionData("", [NEW_STORE_VALUE])
  });
});
