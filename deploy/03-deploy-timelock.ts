import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TIMELOCK_DELAY } from "../helper-hardhat-config";

const deployTimelock: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy } = deployments;
  const { admin } = await getNamedAccounts();
  await deploy("Timelock", {
    from: admin,
    args: [TIMELOCK_DELAY, [], []],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployTimelock;
deployTimelock.tags = ["Timelock"];
