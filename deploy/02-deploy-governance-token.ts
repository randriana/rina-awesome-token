import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { fromEther } from "../test/utils/format";
import { TOTAL_GOV_TOKEN_AMOUNT } from "../helper-hardhat-config";

const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy } = deployments;
  const { admin } = await getNamedAccounts();
  await deploy("GovernanceToken", {
    from: admin,
    args: [fromEther(TOTAL_GOV_TOKEN_AMOUNT)],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ["GovernanceToken"];
