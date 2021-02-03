const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi: abiDai } = require("../artifacts/contracts/Dai.sol/Dai.json");
const { abi: abiLPAP } = require("../artifacts/contracts/AAVE/ILendingPoolAddressesProvider.sol/ILendingPoolAddressesProvider.json");
const { abi: abiLP } = require("../artifacts/contracts/AAVE/ILendingPool.sol/ILendingPool.json");
const { abi: abiWT } = require("../artifacts/contracts/WalkToken.sol/WalkToken.json");
const { abi: abiWB } = require("../artifacts/contracts/WalkBadgeOracle.sol/WalkBadgeOracle.json");
const { abi: abiWTE } = require("../artifacts/contracts/Exchange.sol/WalkTokenExchange.json");
const fs = require("fs"); 

function mnemonic() {
  return fs.readFileSync("./test/mnemonic.txt").toString().trim();
}

//make sure you've switched defaultnetwork to Kovan and put a mnemonic.txt file in the test folder
describe("Pet Project Full Test v1 Kovan", function () {
    let walkToken, walkBadge, walkExchange; //our contracts
    let dai, link, LP, LPAP; //already deployed contracts
    let shelter,  walker, walker_two; //users
    let overrides;
    let exchangeAddress, walkTokenAddress, walkBadgeAddress

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

        link = new ethers.Contract(
            "0xa36085f69e2889c224210f603d836748e7dc0088",
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
        
        exchangeAddress="0x6C6965DB6fbFaBE30ED94F7Fc699e049Ca2a89d7"
        walkTokenAddress="0x69Ea80bb8b111663E78beed20EA5Dee5C9f96982"
        walkBadgeAddress=""
        // await LP.connect(shelter).deposit(dai.address, ethers.BigNumber.from("100000000000000000000"), shelter.getAddress(),ethers.BigNumber.from("0")) //100 dai, 10**20
        // await LP.connect(walker).withdraw(dai.address, ethers.BigNumber.from("100000000000000000000"), walker.getAddress())
    });

    it("deploy walkToken", async () => {
         const WalkToken = await ethers.getContractFactory(
            "WalkToken"
          );
          walkToken = await WalkToken.connect(shelter).deploy(ethers.BigNumber.from((10**24).toLocaleString('fullwide', {useGrouping:false}))); //1,000,000 Walktokens, with 18 decimals. 
          await walkToken.deployed()
          console.log("WalkToken Address: ", walkToken.address)
          walkTokenAddress=walkToken.address
    });

    it("deploy walkExchange", async () => {
        const LPaddress = await LPAP.connect(shelter).getLendingPool();
        walkToken = new ethers.Contract(
            walkTokenAddress, 
            abiWT,
            shelter)     

        const WalkExchange = await ethers.getContractFactory(
            "WalkTokenExchange"
          );

        walkExchange = await WalkExchange.connect(shelter).deploy(walkToken.address, dai.address, LP.address);
        await walkExchange.deployed()
        console.log("Exchange Address: ", walkExchange.address)
        exchangeAddress=walkExchange.address
    })

    it("deploy walkBadge", async () => {
        const LPaddress = await LPAP.connect(shelter).getLendingPool();
        walkToken = new ethers.Contract(
            walkTokenAddress, 
            abiWT,
            shelter)     

        const WalkBadge = await ethers.getContractFactory(
            "WalkBadgeOracle"
          );

        walkBadge = await WalkBadge.connect(shelter).deploy(walkToken.address);
        await walkBadge.deployed()
        console.log("Badge Address: ", walkBadge.address)
        walkBadgeAddress=walkBadge.address
        
        //set badge contract to be able to payTo
        const setting = await walkToken.connect(shelter).changeBadge(walkBadge.address)
        await setting.wait(3)
    })

    it("shelter deposit Dai for redeemability", async () => {
        walkExchange = new ethers.Contract(
            exchangeAddress, 
            abiWTE,
            shelter)  
        
        //deposit Dai into contract
        const approve = await dai.connect(shelter).approve(walkExchange.address, ethers.BigNumber.from((10**20).toLocaleString('fullwide', {useGrouping:false})), overrides); //100 dai
        await approve.wait(3)
        
        const recieve = await walkExchange.connect(shelter).recieveDai(ethers.BigNumber.from((10**20).toLocaleString('fullwide', {useGrouping:false})), overrides); //100 dai
        await recieve.wait(3)
        
        // //transfer ETH to the contract for gas fees (Implement GSN later)
        // const tx = await shelter.sendTransaction({
        //     to: walkExchange.address,
        //     value: ethers.BigNumber.from((10**17).toLocaleString('fullwide', {useGrouping:false})) //0.1 ETH
        // });
        // console.log(tx)
    });

    it("exchange deposit into AAVE", async () => {
        walkExchange = new ethers.Contract(
            exchangeAddress, 
            abiWTE,
            shelter)  

        //deposit 100 dai into AAVE from exchange contract
        const attemptDeposit = await walkExchange.connect(shelter).depositAAVE(ethers.BigNumber.from((10**20).toLocaleString('fullwide', {useGrouping:false})), overrides); //100 dai
        await attemptDeposit.wait(3)
    })

    it("test walker redeem WT for Dai at 1/100 ratio", async () => {
        walkToken = new ethers.Contract(
            walkTokenAddress, 
            abiWT,
            shelter)     
        
        walkExchange = new ethers.Contract(
            exchangeAddress, 
            abiWTE,
            shelter)  
        
        //check Dai balance
        let balance = await dai.connect(shelter).balanceOf(shelter.address);
        console.log("Balance of Shelter Dai after deposit: ", balance.toString());
        
        //redeem 2000 walktokens for 20 dai. This should technically be done by walker but we're working with one mnemonic so...
        const approve = await walkToken.connect(shelter).approve(walkExchange.address,ethers.BigNumber.from((2*10**21).toLocaleString('fullwide', {useGrouping:false})),overrides);
        await approve.wait(3)
        
        const redeemed = await walkExchange.connect(shelter).redeemWTforDai(ethers.BigNumber.from((2*10**19).toLocaleString('fullwide', {useGrouping:false})), overrides); //redeem 20 bucks
        await redeemed.wait(3)
        balance = await dai.connect(shelter).balanceOf(shelter.getAddress());
        console.log("Balance of Shelter Dai after redeem: ", balance.toString());
    })

    it("create badge, call oracle, and update badge. should see a payment too", async () => {
        walkToken = new ethers.Contract(
            walkBadgeAddress, 
            abiWB,
            shelter)  

        //send badge contract some link tokens
        const approve = await link.connect(shelter).approve(walkBadge.address, ethers.BigNumber.from((10**19).toLocaleString('fullwide', {useGrouping:false})), overrides); //10 link
        await approve.wait(3)
        
        const recieve = await walkBadge.connect(shelter).recieveLink(ethers.BigNumber.from((10**19).toLocaleString('fullwide', {useGrouping:false})), overrides); //10 link
        await recieve.wait(3)

        //create badge
        const createB = await walkBadge.connect(shelter).createBadge(shelter.getAddress());
        await createB.wait(3)
        
        //call oracle (check if payTo mint of tokens worked)
        const updateStats = await walkBadge.connect(shelter).updateWalkerStats('jobid bytes',shelter.getAddress());
        await updateStats.wait(3)

        //update badge
        const updateBadge = await walkBadge.connect(shelter).updateBadge(shelter.getAddress());
        await updateBadge.wait(3)

        //get badge data
        const badgeData = await walkBadge.connect(shelter).getBadge(walker.getAddress())
        console.log(`${badgeData[0]} has a badge with:
                        Level of ${badgeData[1]}
                        Total time walked of ${badgeData[2]}
                        Total distance walked of ${badgeData[3]}
                        Total dogs walked of ${badgeData[4]}`)
    })
})