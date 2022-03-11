import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { fromEther } from "../test/utils/format";

const deployToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy } = deployments;
  const { admin } = await getNamedAccounts();
  await deploy("Token", {
    from: admin,
    args: ["Token", "TK", fromEther(1)],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployToken;
deployToken.tags = ["Token"];
