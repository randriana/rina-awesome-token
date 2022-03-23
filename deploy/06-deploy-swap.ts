import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { getExternalContract } from "../utils/helpers";
import { SWAP_POOL_FEE } from "../helper-hardhat-config";

const deploySwap: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;

  const daiContract = getExternalContract("DAI", network.name);
  const usdcContract = getExternalContract("USDC", network.name);
  const weth9Contract = getExternalContract("WETH9", network.name);
  const swapRouterContract = getExternalContract("SwapRouter", network.name);
  const quoterContract = getExternalContract("Quoter", network.name);

  const { deploy } = deployments;
  const { admin } = await getNamedAccounts();
  await deploy("Swap", {
    from: admin,
    args: [
      swapRouterContract,
      quoterContract,
      daiContract,
      usdcContract,
      weth9Contract,
      SWAP_POOL_FEE,
    ],
    log: true,
    waitConfirmations: 1,
  });
};

export default deploySwap;
deploySwap.tags = ["Swap"];
