require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const fs = require("fs");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const defaultNetwork = "localhost"; //use kovan later for AAVE integration

function mnemonic() {
  try {
    return fs.readFileSync("./mnemonic.txt").toString().trim();
  } catch (e) {
    if (defaultNetwork !== "localhost") {
      console.log("☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.")
    }
  }
  return "";
}

module.exports = {
  defaultNetwork,

  networks: {
    localhost: {
      url: "http://localhost:8545",
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/d635ea6eddda4720824cc8b24380e4a9",
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/d635ea6eddda4720824cc8b24380e4a9",
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/d635ea6eddda4720824cc8b24380e4a9",
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    kovan: {
      url: "https://ropsten.infura.io/v3/d635ea6eddda4720824cc8b24380e4a9",
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    xdai: {
      url: 'https://dai.poa.network',
      gasPrice: 1000000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.5.11"
      },
      {
        version: "0.6.0"
      },
      {
        version:"0.5.8"
      },
      {
        version:"0.6.12"
      },
      {
        version:"0.7.0"
      }],
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  etherscan: {
    apiKey: "FQKZCMUAQUA688R7FVDIH9BGD6698JIFPZ"
    //npx hardhat verify --network rinkeby 0xD2820666665C127852213554E2B1cfA8A8199Ef8 "0xa55E01a40557fAB9d87F993d8f5344f1b2408072" "0x36bede640D19981A82090519bC1626249984c908" "0xF4C5310E51F6079F601a5fb7120bC72a70b96e2A" "0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90" "EEEE ABNAEL MACHADO DE LIMA - CENE" "[5,7,10]" "[300,500,100]" "3" "500"
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
};


