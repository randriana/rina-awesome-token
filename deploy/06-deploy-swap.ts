import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const SwapRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const Quoter = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

const deploySwap: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy } = deployments;
  const { admin } = await getNamedAccounts();
  await deploy("Swap", {
    from: admin,
    args: [SwapRouter, Quoter],
    log: true,
    waitConfirmations: 1,
  });
};

export default deploySwap;
deploySwap.tags = ["Swap"];
