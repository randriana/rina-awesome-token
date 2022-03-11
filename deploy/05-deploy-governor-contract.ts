import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployGovernorContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy, get } = deployments;
  const { admin } = await getNamedAccounts();
  const governanceToken = await get("GovernanceToken");
  const timeLock = await get("Timelock");

  await deploy("GovernorContract", {
    from: admin,
    args: [governanceToken.address, timeLock.address],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployGovernorContract;
deployGovernorContract.tags = ["GovernorContract"];
