import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMasterReleaseFund: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy } = deployments;
  const { admin } = await getNamedAccounts();

  await deploy("ReleaseFund", {
    from: admin,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployMasterReleaseFund;
deployMasterReleaseFund.tags = ["MasterReleaseFund"];
