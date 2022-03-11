import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { fromEther } from "../test/utils/format";

const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy } = deployments;
  const { admin } = await getNamedAccounts();
  await deploy("GovernanceToken", {
    from: admin,
    args: [fromEther(100_000)],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ["GovernanceToken"];
