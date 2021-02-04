const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi: abiDai } = require("../artifacts/contracts/Dai.sol/Dai.json");
const fs = require("fs"); 

function mnemonic() {
  return fs.readFileSync("./test/mnemonic.txt").toString().trim();
}
describe("Pet Project Full Test v1 Kovan", function () {
    let oracleTest, walkBadge, walkExchange; //our contracts
    let dai, link, LP, LPAP; //already deployed contracts
    let shelter,  walker, walker_two; //users
    let overrides;

    it("deploy/setup Kovan contracts", async () => {
        overrides = {
            gasLimit: ethers.BigNumber.from("10000000"),
          };

        provider = new ethers.providers.InfuraProvider("kovan", {
            projectId: "d635ea6eddda4720824cc8b24380e4a9",
            projectSecret: "b4ea2b15f0614105a64f0e8ba1f2bffa"
          });
    
        shelter = ethers.Wallet.fromMnemonic(mnemonic()); //shelter mnem
        shelter = await shelter.connect(provider);

        link = new ethers.Contract(
            "0xa36085f69e2889c224210f603d836748e7dc0088",
            abiDai,
            shelter)    
    });

    it("deploy oracle and test", async () => {
        const OracleTest = await ethers.getContractFactory(
           "oracleTest"
         );
         oracleTest = await OracleTest.connect(shelter).deploy(overrides); //1,000,000 Walktokens, with 18 decimals. 
         await oracleTest.deployed()

         //send badge contract 1 link token
        const approve = await link.connect(shelter).approve(oracleTest.address, ethers.BigNumber.from((10**18).toLocaleString('fullwide', {useGrouping:false})), overrides); //1 link
        await approve.wait(1)
        
        const recieve = await oracleTest.connect(shelter).recieveLink("0xa36085f69e2889c224210f603d836748e7dc0088", ethers.BigNumber.from((10**18).toLocaleString('fullwide', {useGrouping:false})), overrides); //1 link
        await recieve.wait(1)
        
        const update = await oracleTest.connect(shelter).updateWalkerStats(overrides);
        await update.wait(1)

        const result = await oracleTest.connect(shelter).testReturn();
        console.log(result.toString())
   });
})