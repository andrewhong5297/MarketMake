const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi: abiDai } = require("../artifacts/contracts/Dai.sol/Dai.json");
const { abi: abiOT } = require("../artifacts/contracts/oracleTest.sol/oracleTest.json");
const fs = require("fs"); 

function mnemonic() {
  return fs.readFileSync("./test/mnemonic.txt").toString().trim();
}
describe("Pet Project Full Test v1 Kovan", function () {
    let oracleTest, walkBadge, walkExchange; //our contracts
    let dai, link, LP, LPAP; //already deployed contracts
    let shelter,  walker, walker_two; //users
    let overrides, oracleTestAddress;

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
        
            oracleTestAddress = "0xC18930FD7eeDDc70257b47F830889E349e3cd185"
    });

   it("deploy oracle and test", async () => {
        const OracleTest = await ethers.getContractFactory(
           "oracleTest"
         );
         oracleTest = await OracleTest.connect(shelter).deploy(overrides); //1,000,000 Walktokens, with 18 decimals. 
         await oracleTest.deployed()
         oracleTestAddress = oracleTest.address

         //send badge contract 1 link token
        const approve = await link.connect(shelter).approve(oracleTest.address, ethers.BigNumber.from((2*10**18).toLocaleString('fullwide', {useGrouping:false})), overrides); //1 link
        await approve.wait(1)
        
        const recieve = await oracleTest.connect(shelter).recieveLink("0xa36085f69e2889c224210f603d836748e7dc0088", ethers.BigNumber.from((2*10**18).toLocaleString('fullwide', {useGrouping:false})), overrides); //1 link
        await recieve.wait(2)

        const preresult = await oracleTest.connect(shelter).testReturn();
        console.log("link recieved, showing pretest result")
        console.log(preresult.toString())
   });

   it("call oracle", async () =>{
    oracleTest = new ethers.Contract(
      oracleTestAddress,
      abiOT,
      shelter)
      
      const update = await oracleTest.connect(shelter).testOracle(overrides);
      await update.wait(1)

      const result = await oracleTest.connect(shelter).testReturn();
      console.log(result.toString())
   })
})