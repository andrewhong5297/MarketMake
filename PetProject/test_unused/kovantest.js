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

function mnemonic2() {
    return fs.readFileSync("./test/mnemonic2.txt").toString().trim();
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
    
        shelter = ethers.Wallet.fromMnemonic(mnemonic2()); //shelter mnem
        shelter = await shelter.connect(provider);
        
        walker = ethers.Wallet.fromMnemonic(mnemonic()); //walker mnem (needs to me main acc for oracle reasons)
        walker = await walker.connect(provider);
        
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
        
        exchangeAddress="0x3d3617813FCF202c7d4e7c7f8AA95950C4433650"
        walkTokenAddress="0xD50C749345450973C2b89f273E1a16c8C2629f89"
        walkBadgeAddress="0x5b184696AC691FD673Dee02Bf11Bf922daeF9E66"
        // await LP.connect(shelter).deposit(dai.address, ethers.BigNumber.from("100000000000000000000"), shelter.getAddress(),ethers.BigNumber.from("0")) //100 dai, 10**20
        // await LP.connect(walker).withdraw(dai.address, ethers.BigNumber.from("100000000000000000000"), walker.getAddress())
    });

    xit("deploy walkToken", async () => {
         const WalkToken = await ethers.getContractFactory(
            "WalkToken"
          );
          walkToken = await WalkToken.connect(shelter).deploy(ethers.BigNumber.from((10**24).toLocaleString('fullwide', {useGrouping:false}))); //1,000,000 Walktokens, with 18 decimals. 
          await walkToken.deployed()
          console.log("WalkToken Address: ", walkToken.address)
          walkTokenAddress=walkToken.address

          const mintTo = await walkToken.connect(shelter).payTo(ethers.BigNumber.from((10**22).toLocaleString('fullwide', {useGrouping:false})),walker.getAddress())
          await mintTo.wait(1)
    });

    xit("deploy walkExchange", async () => {
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

    xit("deploy walkBadge", async () => {
        walkToken = new ethers.Contract(
            walkTokenAddress, 
            abiWT,
            shelter)     

        const WalkBadge = await ethers.getContractFactory(
            "WalkBadgeOracle"
          );

        walkBadge = await WalkBadge.connect(shelter).deploy(walkToken.address, link.address);
        await walkBadge.deployed()
        console.log("Badge Address: ", walkBadge.address)
        walkBadgeAddress=walkBadge.address

        //set badge contract to be able to payTo
        const setting = await walkToken.connect(shelter).changeBadge(walkBadge.address)
        await setting.wait(1)

        //send badge contract 1 link token
        const approve = await link.connect(shelter).approve(walkBadge.address, ethers.BigNumber.from((10**18).toLocaleString('fullwide', {useGrouping:false})), overrides); //1 link
        await approve.wait(1)
        
        const recieve = await walkBadge.connect(shelter).recieveLink(ethers.BigNumber.from((10**18).toLocaleString('fullwide', {useGrouping:false})), overrides); //1 link
        await recieve.wait(1)

        const oraclej = await walkBadge.connect(shelter).setOracleAddress("0xf5A4036CA35B9C017eFA49932DcA4bc8cc781Aa4") //address of node op. dont forget to update jobid and fee too
        await oraclej.wait(1)
    })

    it("walker create badge, call oracle, and update badge. Walker should see a payment too", async () => {
        walkToken = new ethers.Contract(
            walkTokenAddress, 
            abiWT,
            shelter)  
        
        walkBadge = new ethers.Contract(
            walkBadgeAddress, 
            abiWB,
            shelter)  

        // //create badge
        // const createB = await walkBadge.connect(walker).createBadge(walker.getAddress(), overrides);
        // await createB.wait(1)
        // const badgeDataBefore = await walkBadge.connect(walker).getBadge(walker.getAddress(), overrides)
        // console.log(`${badgeDataBefore[0]} has a badge with:
        //                 Level of ${badgeDataBefore[1]}
        //                 Total time walked of ${badgeDataBefore[2]}
        //                 Total distance walked of ${badgeDataBefore[3]}
        //                 Total dogs walked of ${badgeDataBefore[4]}`)

        // //call oracle (check if payTo mint of tokens worked)
        // const balance = await walkToken.connect(shelter).balanceOf(walker.getAddress(), overrides)
        // console.log("balance of WT before payment ", balance.toString());

        const orc = await walkBadge.connect(walker).oracle();
        console.log("oracle at: ", orc);
        const reqID = await walkBadge.connect(walker).reqIDtest();
        console.log(reqID);
        
        // const updateStats = await walkBadge.connect(walker).updateWalkerStats(walker.getAddress(), overrides); //jobID and walker address
        // await updateStats.wait(3)
        
        // const balance2 = await walkToken.connect(shelter).balanceOf(walker.getAddress(), overrides)
        // console.log("balance of WT after payment ", balance2.toString());

        //update badge
        const updateBadge = await walkBadge.connect(walker).updateBadge(walker.getAddress(), overrides);
        await updateBadge.wait(1)

        //get badge data
        const badgeDataAfter = await walkBadge.connect(walker).getBadge(walker.getAddress(), overrides)
        console.log(`${badgeDataAfter[0]} has a badge with:
                        Level of ${badgeDataAfter[1]}
                        Total time walked of ${badgeDataAfter[2]}
                        Total distance walked of ${badgeDataAfter[3]}
                        Total dogs walked of ${badgeDataAfter[4]}`)
    })

    xit("shelter deposit Dai into exchange for walkers' redeemability", async () => {
        walkExchange = new ethers.Contract(
            exchangeAddress, 
            abiWTE,
            shelter)  
        
        //deposit Dai into contract
        const approve = await dai.connect(shelter).approve(walkExchange.address, ethers.BigNumber.from((10**20).toLocaleString('fullwide', {useGrouping:false})), overrides); //100 dai
        await approve.wait(1)
        
        const recieve = await walkExchange.connect(shelter).recieveDai(ethers.BigNumber.from((10**20).toLocaleString('fullwide', {useGrouping:false})), overrides); //100 dai
        await recieve.wait(1)
        
        // //transfer ETH to the contract for gas fees (Implement GSN later)
        // const tx = await shelter.sendTransaction({
        //     to: walkExchange.address,
        //     value: ethers.BigNumber.from((10**17).toLocaleString('fullwide', {useGrouping:false})) //0.1 ETH
        // });
        // console.log(tx)
    });

    xit("exchange deposits Dai into AAVE", async () => {
        walkExchange = new ethers.Contract(
            exchangeAddress, 
            abiWTE,
            shelter)  

        //deposit 100 dai into AAVE from exchange contract
        const attemptDeposit = await walkExchange.connect(shelter).depositAAVE(ethers.BigNumber.from((10**20).toLocaleString('fullwide', {useGrouping:false})), overrides); //100 dai
        await attemptDeposit.wait(1)
    })

    xit("test walker redeem WT for Dai at 1/100 ratio, with withdrawal call from AAVE if balance not enough", async () => {
        walkToken = new ethers.Contract(
            walkTokenAddress, 
            abiWT,
            shelter)     
        
        walkExchange = new ethers.Contract(
            exchangeAddress, 
            abiWTE,
            shelter)  
        
        //check Dai balance
        let balance = await dai.connect(walker).balanceOf(walker.getAddress());
        console.log("Balance of Walker Dai before redeem: ", balance.toString());
        
        //redeem 2000 walktokens for 20 dai. This should technically be done by walker but we're working with one mnemonic so...
        const approve = await walkToken.connect(walker).approve(walkExchange.address,ethers.BigNumber.from((2*10**21).toLocaleString('fullwide', {useGrouping:false})),overrides);
        await approve.wait(1)
        
        const redeemed = await walkExchange.connect(walker).redeemWTforDai(ethers.BigNumber.from((2*10**19).toLocaleString('fullwide', {useGrouping:false})), overrides); //redeem 20 bucks
        await redeemed.wait(1)
        balance = await dai.connect(walker).balanceOf(walker.getAddress());
        console.log("Balance of Walker Dai after redeem: ", balance.toString());
    })

    xit("test walker buying an NFT from exchange contract", async () => {
        //still have to write this contract
    })

})