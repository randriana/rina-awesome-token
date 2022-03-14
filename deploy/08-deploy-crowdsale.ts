import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployCrowdsale: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;

  const { deploy, get } = deployments;
  const { admin, horde } = await getNamedAccounts();
  const token = await ethers.getContract("Token", admin);
  const swap = await get("Swap");
  const treasury = await get("Treasury");

  await deploy("Crowdsale", {
    from: admin,
    args: [
      horde,
      token.address,
      ethers.constants.WeiPerEther,
      swap.address,
      treasury.address,
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
