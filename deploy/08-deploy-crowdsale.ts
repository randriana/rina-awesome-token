import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { fromEther } from "../test/utils/format";
import { ethers } from "hardhat";

const deployCrowdsale: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy, get } = deployments;
  const { admin, horde } = await getNamedAccounts();
  const token = await get("Token");
  const swap = await get("Swap");
  const treasury = await get("Treasury");

  await deploy("Crowdsale", {
    from: admin,
    args: [
      horde,
      token.address,
      ethers.constants.WeiPerEther,
      swap.address,
      fromEther(0.03),
      treasury.address,
    ],
    log: true,
    waitConfirmations: 1,
  });
};

export default deployCrowdsale;
deployCrowdsale.tags = ["Crowdsale"];
