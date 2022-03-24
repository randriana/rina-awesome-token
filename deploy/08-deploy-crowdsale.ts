import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { getExternalContract } from "../utils/helpers";

const deployCrowdsale: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;

  const { deploy, get } = deployments;
  const { admin, horde } = await getNamedAccounts();
  const token = await ethers.getContract("Token", admin);
  const swap = await get("Swap");
  const treasury = await get("Treasury");

  const daiContract = getExternalContract("DAI", network.name);
  const usdcContract = getExternalContract("USDC", network.name);

  await deploy("Crowdsale", {
    from: admin,
    args: [
      horde,
      treasury.address,
      daiContract,
      token.address,
      swap.address,
      ethers.constants.WeiPerEther,
      [daiContract, usdcContract],
    ],
    log: true,
    waitConfirmations: 1,
  });

  const crowdsale = await ethers.getContract("Crowdsale", admin);

  await token.grantRole(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
    crowdsale.address
  );

  await crowdsale.grantRole(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MAINTAINER_ROLE")),
    admin
  );
};

export default deployCrowdsale;
deployCrowdsale.tags = ["Crowdsale"];
