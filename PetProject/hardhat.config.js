require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const fs = require("fs");

const defaultNetwork = "kovan"; 

function mnemonic() {
  try {
    return fs.readFileSync("./mnemonic.txt").toString().trim();
  } catch (e) {
    if (defaultNetwork !== "localhost") {
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
      url: "https://rinkeby.infura.io/v3/faefe1dcd6094fb388019173d2328d8f",
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/cc9ead11daad4fcf819ce82b503f1651", //new
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/faefe1dcd6094fb388019173d2328d8f",
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    kovan: {
      url: "https://kovan.infura.io/v3/faefe1dcd6094fb388019173d2328d8f",
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
      },
      {
        version:"0.8.4"
      }],
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  etherscan: {
    apiKey: "FQKZCMUAQUA688R7FVDIH9BGD6698JIFPZ"
    //npx hardhat verify --network mainnet 0x45Bd6a721582bc7C61562A6Cd4590c391899a759 "0xc3a9b2be34d7605eef2ec39c7f5b00e71552d319"
    //npx hardhat verify --network mainnet 0xc3a9b2be34d7605eef2ec39c7f5b00e71552d319 "0xc3a9b2be34d7605eef2ec39c7f5b00e71552d319"
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 10000000
  }
};


