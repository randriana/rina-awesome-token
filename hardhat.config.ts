import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const accounts = [
  process.env.PERSONAL_PRIVATE_KEY || "",
  process.env.HORDE_PRIVATE_KEY || "",
  process.env.MOCK_USER_PRIVATE_KEY || "",
];

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URI !== undefined ? process.env.ROPSTEN_URI : "",
      accounts: accounts,
      gas: 2100000,
      gasPrice: 8000000000,
    },
    rinkeby: {
      url: process.env.RINKEBY_URI !== undefined ? process.env.RINKEBY_URI : "",
      accounts: accounts,
    },
    localhost: {
      gas: 2100000,
      gasPrice: 9300000000,
    },
    hardhat: {
      chainId: 1337,
      forking: {
        url: process.env.FORK_URI !== undefined ? process.env.FORK_URI : "",
        blockNumber: 14306438,
      },
      accounts: accounts.map((acc) => ({
        privateKey: acc,
        balance: (10 * Math.pow(10, 18)).toString(),
      })),
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    admin: {
      default: 0,
    },
    horde: {
      default: 1,
    },
    mockUser: {
      default: 2,
    },
  },
};

export default config;
