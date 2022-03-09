import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy("Token", {
    from: deployer,
    args: ["Rina Super Coin", "RISC"],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployToken;
deployToken.tags = ["Token"];
