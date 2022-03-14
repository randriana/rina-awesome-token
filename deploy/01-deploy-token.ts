import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { fromEther } from "../test/utils/format";
import {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOTAL_TOKEN_AMOUNT,
} from "../helper-hardhat-config";

const deployToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy } = deployments;
  const { admin } = await getNamedAccounts();
  await deploy("Token", {
    from: admin,
    args: [TOKEN_NAME, TOKEN_SYMBOL, fromEther(TOTAL_TOKEN_AMOUNT)],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployToken;
deployToken.tags = ["Token"];
