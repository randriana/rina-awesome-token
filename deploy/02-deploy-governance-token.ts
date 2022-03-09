import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy("GovernanceToken", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ["GovernanceToken"];
