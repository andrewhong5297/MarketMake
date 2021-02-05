const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi: abiDai } = require("../artifacts/contracts/Dai.sol/Dai.json");
const { abi: abiOT } = require("../artifacts/contracts/oracleTest.sol/oracleTest.json");
const fs = require("fs"); 

function mnemonic() {
  return fs.readFileSync("./test/mnemonic.txt").toString().trim();
}
describe("Pet Project Full Test v1 Kovan", function () {
    let oracleTest, walkBadge, walkExchange, typesLibrary; //our contracts
    let dai, link, LP, LPAP; //already deployed contracts
    let shelter,  walker, walker_two; //users
    let overrides
    let oracleTestAddress

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
        
            oracleTestAddress = "0xf81fbd80B6D9Cf8F2868707D6692164c798fFb29"
    });

   it("deploy oracle and test", async () => {
        const TypesLibrary = await ethers.getContractFactory(
          "typesLibrary"
        );
        typesLibrary = await TypesLibrary.connect(shelter).deploy(overrides); //1,000,000 Walktokens, with 18 decimals. 
        await typesLibrary.deployed()
        console.log("library at: ", typesLibrary.address)

        const OracleTest = await ethers.getContractFactory(
           "oracleTest",
           {
            libraries: {
              typesLibrary: typesLibrary.address
            }
          }
         );
         oracleTest = await OracleTest.connect(shelter).deploy(overrides); //1,000,000 Walktokens, with 18 decimals. 
         await oracleTest.deployed()
         oracleTestAddress = oracleTest.address
         console.log("Oracle at: ", oracleTest.address)

         //send badge contract 1 link token
        const approve = await link.connect(shelter).approve(oracleTest.address, ethers.BigNumber.from((2*10**18).toLocaleString('fullwide', {useGrouping:false})), overrides); //1 link
        await approve.wait(1)
        
        const recieve = await oracleTest.connect(shelter).recieveLink("0xa36085f69e2889c224210f603d836748e7dc0088", ethers.BigNumber.from((2*10**18).toLocaleString('fullwide', {useGrouping:false})), overrides); //1 link
        await recieve.wait(2)
   });

   it("call oracle", async () =>{
    oracleTest = new ethers.Contract(
      oracleTestAddress,
      abiOT,
      shelter)
      
      const update = await oracleTest.connect(shelter).testOracle(overrides);
      await update.wait(6)

      const result = await oracleTest.connect(shelter).testReturn();
      console.log("Expect 18700: ", result.toString())
      const b_result = await oracleTest.connect(shelter).testRawReturn();
      console.log("raw: ", b_result.toString())
   })
})