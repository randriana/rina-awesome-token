import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployTimelock: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy } = deployments;
  const { admin } = await getNamedAccounts();
  await deploy("Timelock", {
    from: admin,
    args: [3600, [], []],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployTimelock;
deployTimelock.tags = ["Timelock"];
