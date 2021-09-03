const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi: abiDai } = require("../artifacts/contracts/Dai.sol/Dai.json");
const { abi: abiLPAP } = require("../artifacts/contracts/AAVE/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json");
const { abi: abiLP } = require("../artifacts/contracts/AAVE/ILendingPool.sol/ILendingPool.json");
const { abi: abiWT } = require("../artifacts/contracts/WalkToken.sol/WalkToken.json");
const { abi: abiDT } = require("../artifacts/contracts/DogToy.sol/DogToy.json");
const { abi: abiWB } = require("../artifacts/contracts/WalkBadgeOracle.sol/WalkBadgeOracle.json");
const { abi: abiWTE } = require("../artifacts/contracts/Exchange.sol/WalkTokenExchange.json");
const fs = require("fs"); 

function mnemonic() {
  return fs.readFileSync("./test/mnemonic.txt").toString().trim();
}

//make sure you've switched defaultnetwork to Kovan and put a mnemonic.txt file in the test folder
describe("Pet Project Full Test v1 Kovan", function () {
    let splitter, splitproxy

    it("deploy/setup Kovan contracts", async () => {
        overrides = {
            gasLimit: ethers.BigNumber.from("10000000"),
          };

        provider = new ethers.providers.InfuraProvider("kovan", {
            projectId: "faefe1dcd6094fb388019173d2328d8f",
            projectSecret: "dffad28934914b97a5365fa0c2eb9de6"
          });
            
        owner = ethers.Wallet.fromMnemonic(mnemonic()); //walker mnem (needs to me main acc for oracle reasons)
        owner = await owner.connect(provider);
        
        // const TypesLibrary = await ethers.getContractFactory(
        //     "typesLibrary"
        //   );
        // typesLibrary = await TypesLibrary.connect(shelter).deploy(overrides); 
        // await typesLibrary.deployed()
        // console.log("library at: ", typesLibrary.address)

        const Splitter = await ethers.getContractFactory(
            "Splitter",
        );
        splitter = await Splitter.connect(owner).deploy(walkTokenAddress, link.address, overrides); 
        await walkBadge.deployed()
    })
})