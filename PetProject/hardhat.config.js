require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-contract-sizer');

const fs = require("fs");

const defaultNetwork = "rinkeby";

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
      url: "https://rinkeby.infura.io/v3/9e181ea092734f8c885be4fd21bf3bc5",
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/9e181ea092734f8c885be4fd21bf3bc5", //new
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/9e181ea092734f8c885be4fd21bf3bc5",
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    kovan: {
      url: "https://kovan.infura.io/v3/9e181ea092734f8c885be4fd21bf3bc5",
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
        version: "0.4.16"
      },
      {
        version: "0.6.0"
      },
      {
        version: "0.6.12"
      },
      {
        version: "0.6.8"
      },
      {
        version: "0.8.0"
      },
      {
        version: "0.7.0"
      },
      {
        version: "0.8.3"
      },
      {
        version: "0.8.4"
      }],
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  etherscan: {
    apiKey: "FQKZCMUAQUA688R7FVDIH9BGD6698JIFPZ"
    //idk npx hardhat verify --network mainnet 0x45Bd6a721582bc7C61562A6Cd4590c391899a759 "0xc3a9b2be34d7605eef2ec39c7f5b00e71552d319"
    //Crowdfund? npx hardhat verify --network mainnet 0xc3a9b2be34d7605eef2ec39c7f5b00e71552d319 "0xc3a9b2be34d7605eef2ec39c7f5b00e71552d319"
    //SplitFactory npx hardhat verify --network mainnet 0xb61feD6D59F9bAB219f2B9Ccab6c8e7016255e44 "0x2f81E57ff4f4d83B40a9f719fD892D8E806e0761" "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    //Splitter npx hardhat verify --network mainnet 0x2f81E57ff4f4d83B40a9f719fD892D8E806e0761
    //mirrorwritetoken npx hardhat verify --network rinkeby 0x6e3fCbb6f5c0D206B061A04f92827C780EEc58b5
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
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


