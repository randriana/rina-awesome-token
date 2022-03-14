import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { fromEther } from "../test/utils/format";
import {
  TREASURY_MAX_DONATION_AMOUNT,
  TREASURY_MAX_RELEASE_AMOUNT,
} from "../helper-hardhat-config";
import { Token } from "../typechain";

const deployTreasury: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, ethers } = hre;

  const { deploy, get } = deployments;
  const { admin } = await getNamedAccounts();
  const masterReleaseFund = await get("ReleaseFund");
  const governanceToken = await get("GovernanceToken");
  const token = await ethers.getContract("Token", admin);

  const blockNumber = await ethers.provider.getBlockNumber();

  const treasury = await deploy("Treasury", {
    from: admin,
    args: [
      masterReleaseFund.address,
      governanceToken.address,
      token.address,
      blockNumber,
      blockNumber,
      fromEther(TREASURY_MAX_RELEASE_AMOUNT),
      fromEther(TREASURY_MAX_DONATION_AMOUNT),
    ],
    log: true,
    waitConfirmations: 1,
  });

  await token.grantRole(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MAINTAINER_ROLE")),
    admin
  );

  await token.setFeeCollector(treasury.address);
};

export default deployTreasury;
deployTreasury.tags = ["Treasury"];
