import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { fromEther } from "../test/utils/format";

const deployTreasury: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, ethers } = hre;

  const { deploy, get } = deployments;
  const { admin } = await getNamedAccounts();
  const masterReleaseFund = await get("ReleaseFund");
  const governanceToken = await get("GovernanceToken");
  const token = await get("Token");

  const blockNumber = await ethers.provider.getBlockNumber();

  await deploy("Treasury", {
    from: admin,
    args: [
      masterReleaseFund.address,
      governanceToken.address,
      token.address,
      blockNumber,
      blockNumber,
      fromEther(100_000),
      fromEther(100_000),
    ],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployTreasury;
deployTreasury.tags = ["Treasury"];
