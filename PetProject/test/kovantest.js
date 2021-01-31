const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi: abiDai } = require("../artifacts/contracts/Dai.sol/Dai.json");
const { abi: abiLPAP } = require("../artifacts/contracts/AAVE/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json");
const { abi: abiLP } = require("../artifacts/contracts/AAVE/ILendingPool.sol/ILendingPool.json");
const { abi: abiWT } = require("../artifacts/contracts/WalkToken.sol/WalkToken.json");
const { abi: abiWTE } = require("../artifacts/contracts/Exchange.sol/WalkTokenExchange.json");
const fs = require("fs"); 

function mnemonic() {
  return fs.readFileSync("./test/mnemonic.txt").toString().trim();
}

//make sure you've switched defaultnetwork to Kovan and put a mnemonic.txt file in the test folder
describe("Pet Project Full Test v1 Kovan", function () {
    let walkToken, walkBadge, walkExchange; //our contracts
    let dai, aDai, LP, LPAP; //already deployed contracts
    let shelter, mochi, walker, walker_two; //users
    let overrides;

    it("deploy/setup Kovan contracts", async () => {
        overrides = {
            gasLimit: ethers.BigNumber.from("10000000"),
          };

        provider = new ethers.providers.InfuraProvider("kovan", {
            projectId: "d635ea6eddda4720824cc8b24380e4a9",
            projectSecret: "b4ea2b15f0614105a64f0e8ba1f2bffa"
          });
    
        shelter = ethers.Wallet.fromMnemonic(mnemonic()); //(Step 1) connect your mnemonic
        shelter = await shelter.connect(provider);
        
        dai = new ethers.Contract(
            "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",
            abiDai,
            shelter)     

        LPAP = new ethers.Contract(
            "0x88757f2f99175387aB4C6a4b3067c77A695b0349",
            abiLPAP,
            shelter)     
        
        const LPaddress = await LPAP.connect(shelter).getLendingPool();

        LP = new ethers.Contract(
            LPaddress, //"0x9FE532197ad76c5a68961439604C037EB79681F0" listed address in their docs is different from the LPaddress. Not sure which one to use. 
            abiLP,
            shelter)     

        const walkerAccount = await LP.getUserAccountData(shelter.getAddress())
        console.log(walkerAccount);

        // await LP.connect(shelter).deposit(dai.address, ethers.BigNumber.from("100000000000000000000"), shelter.getAddress(),ethers.BigNumber.from("0")) //100 dai, 10**20
        // await LP.connect(walker).withdraw(dai.address, ethers.BigNumber.from("100000000000000000000"), walker.getAddress())
    });

    xit("deploy walkToken", async () => {
         // const WalkToken = await ethers.getContractFactory(
        //     "WalkToken"
        //   );
        //   walkToken = await WalkToken.connect(shelter).deploy(ethers.BigNumber.from("2000000000000000000000")); //1000 Walktokens, with 18 decimals. 
        //   console.log(walkToken)
    });

    xit("deploy walkExchange", async () => {
        const LPaddress = await LPAP.connect(shelter).getLendingPool();
        walkToken = new ethers.Contract(
            "0x69Ea80bb8b111663E78beed20EA5Dee5C9f96982", 
            abiWT,
            shelter)     

        const WalkExchange = await ethers.getContractFactory(
            "WalkTokenExchange"
          );

        walkExchange = await WalkExchange.connect(shelter).deploy(walkToken.address, dai.address, LPaddress);
    })

    it("send ETH for gas and Dai for redeemability, and deposit into AAVE", async () => {
        walkExchange = new ethers.Contract(
            "0x7e83B9858DcD28EC677326a20d63daeE386A08a7", 
            abiWTE,
            shelter)  
        
        //deposit Dai into contract
        // await dai.connect(shelter).approve(walkExchange.address, ethers.BigNumber.from("200"), overrides);
        // await walkExchange.connect(shelter).recieveDai(ethers.BigNumber.from("200"), overrides);
        
        // //transfer ETH to the contract for gas fees (Implement GSN later)
        // const tx = await shelter.sendTransaction({
        //     to: walkExchange.address,
        //     value: ethers.BigNumber.from("100000000000000000") //0.1 ETH
        // });
        // console.log(tx)

        //deposit 200 dai into AAVE from exchange contract
        const attemptDeposit = await walkExchange.connect(shelter).depositAAVE(ethers.BigNumber.from("200"), overrides);
        console.log(attemptDeposit);
    })

    xit("test redeem WT for Dai at 1/100 ratio", async () => {
        //check Dai balance
        let balance = await dai.connect(shelter).balanceOf(shelter.getAddress());
        console.log("Balance of Dai after deposit: ", balance);

        walkExchange = new ethers.Contract(
            "0x7e83B9858DcD28EC677326a20d63daeE386A08a7", 
            abiWTE,
            shelter)  

        //redeem 200*100 walktokens for 200 dai. This should technically be done by walker but we're working with one mnemonic so...
        await walkExchange.connect(shelter).redeemWTforDai(ethers.BigNumber.from("20000"));
        balance = dai.connect(shelter).balanceOf(shelter.getAddress());
        console.log("Balance of Dai after redeem: ", balance);
    })
})