import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { GovernanceToken } from "../../typechain/GovernanceToken.d";
import { toEther } from "../utils/format";
import { moveBlocks } from "../../utils/move-blocks";

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }) => {
    await deployments.fixture();
    const { admin } = await getNamedAccounts();
    const governanceToken: GovernanceToken = await ethers.getContract(
      "GovernanceToken",
      admin
    );
    const timelock = ethers.getContract("Timelock", admin);
    const governorContract = ethers.getContract("GovernorContract", admin);

    return {
      admin,
      governanceToken,
      timelock,
      governorContract,
    };
  }
);

describe("Voting process", function () {
  it("Should be able to propose", async () => {
    const { admin, governanceToken } = await setupTest();
    await governanceToken.delegate(admin);

    // const encodedFunctionCall = box.interface.encodeFunctionData("", [NEW_STORE_VALUE])
  });
});
