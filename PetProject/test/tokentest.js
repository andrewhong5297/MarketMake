const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi: abiDai } = require("../artifacts/contracts/Dai.sol/Dai.json");

describe("Pet Project Full Test v1 Local", function () {
    let walkToken, walkBadge, walkExchange;
    let dai, aDai, AAVE; 
    let shelter, mochi, walker, walker_two;

    xit("deploy/setup Kovan contracts", async () => {
        //mnemonic

        Dai = new ethers.Contract(
            "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",
            abiDai,
            owner)     
    });

    it("deploy local testing contracts", async () => {
        [shelter, mochi, walker, walker_two] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

        const DaiContract = await ethers.getContractFactory("Dai"); //contract name here
        dai = await DaiContract.connect(walker).deploy(ethers.BigNumber.from("0"));
        await dai.connect(walker).mint(walker.getAddress(),ethers.BigNumber.from("100"))

        const WalkToken = await ethers.getContractFactory(
            "WalkToken"
          );
          walkToken = await WalkToken.connect(shelter).deploy(ethers.BigNumber.from("20000000000"));
        await walkToken.deployed();
        
        const WalkExchange = await ethers.getContractFactory(
            "WalkTokenExchange"
          );

        walkExchange = await WalkExchange.connect(shelter).deploy(walkToken.address, dai.address);

        const WalkBadge = await ethers.getContractFactory(
            "WalkBadge"
          );

        walkBadge = await WalkBadge.connect(shelter).deploy()
    });

    it("test walkToken contract", async () => {
      const balance = await walkToken.connect(shelter).balanceOf(shelter.getAddress());
      const totalSupply = await walkToken.connect(shelter).totalSupply();

      console.log("shelter balance of WalkToken: ", balance.toString());
      console.log("total supply of WalkToken: ", totalSupply.toString());

      await expect(walkToken.connect(mochi).mint(ethers.BigNumber.from("1000"))).to.be.revertedWith("only shelter can mint, not dogs"); //should fail
      await walkToken.connect(shelter).mint(ethers.BigNumber.from("1000")) //should work
      const balance2 = await walkToken.connect(shelter).balanceOf(shelter.getAddress());
      console.log("shelter balance of WalkToken after minting 1000 more walkTokens: ", balance2.toString());
    })  

    it("pay walker for walking mochi for 300 minutes", async () => {
        //this data should be from API, where all new walks in the last week are paid out every Monday. 
        const walkedAmount=60; 
        const distanceTraveled=2; 

        const totalPayout = walkedAmount*distanceTraveled;

        await walkToken.connect(shelter).transfer(walker.getAddress(), ethers.BigNumber.from(totalPayout));
        const balance = await walkToken.connect(walker).balanceOf(walker.getAddress());
        console.log("walker balance of WalkToken: ", balance.toString());

        const balance2 = await walkToken.connect(shelter).balanceOf(shelter.getAddress());
        console.log("shelter balance of WalkToken: ", balance2.toString());

        const totalSupply = await walkToken.connect(shelter).totalSupply();
        console.log("total supply of WalkToken: ", totalSupply.toString());
    })

    it("test 60 walkTokens or Dai transfer to exchange", async () => {
        await walkToken.connect(walker).approve(walkExchange.address, ethers.BigNumber.from("60"))
        await walkExchange.connect(walker).recieveERC20(ethers.BigNumber.from("60"))

        const balance = await walkToken.connect(shelter).balanceOf(walkExchange.address)        
        expect(balance.toString()).to.equal("60")
        
        //test Dai deposit then into AAVE
    });

    //walkBadge should be non-transferrable, so not a token. 
    it("walker use walktokens redeem an NFT Achievement Badge", async () => {            
        //every Monday, request to create or update Badge for each walker who did at least one new walk in the last week.
        await walkBadge.connect(shelter).requestBadge(walker.getAddress(),ethers.BigNumber.from("4"),ethers.BigNumber.from("32"),ethers.BigNumber.from(1)); //this should eventually be an API call
        //print badge for second walker
        await walkBadge.connect(shelter).requestBadge(walker_two.getAddress(),ethers.BigNumber.from("4"),ethers.BigNumber.from("32"),ethers.BigNumber.from(1)); //this should eventually be an API call

        //print new badge data
        let badgeData = await walkBadge.connect(shelter).getBadge(walker.getAddress())
        console.log(`${badgeData[0]} has a badge with:
                        Level of ${badgeData[1]}
                        Total time walked of ${badgeData[2]}
                        Total distance walked of ${badgeData[3]}
                        Total dogs walked of ${badgeData[4]}`)

        //test again to see if update works correctly
        await walkBadge.connect(shelter).requestBadge(walker.getAddress(),ethers.BigNumber.from("10"),ethers.BigNumber.from("97"),ethers.BigNumber.from(4)); 

        //print updated badge data
        badgeData = await walkBadge.connect(shelter).getBadge(walker.getAddress())
        console.log(`${badgeData[0]} has a badge with:
                        Level of ${badgeData[1]}
                        Total time walked of ${badgeData[2]}
                        Total distance walked of ${badgeData[3]}
                        Total dogs walked of ${badgeData[4]}`)
        
        const newFilter = await walkBadge.filters.updatedBadge();
        
        console.log(walkBadge.address)
        console.log(newFilter)
    });

    //Joe to recreate using WalkBadge as template
    xit("walker using walktokens to redeem NFTs that represent real world goods", async () => {
        //deploy WalkCoupon contract, redeem for shirts, services, etc. 

        ////ERC721 version of walkBadge for reference, decided not to go with NFT for the badge since it wouldn't be traded. Though ERC1155 might be better for this one. 
        // const WalkBadge = await ethers.getContractFactory(
        //     "WalkBadge"
        //   );
        //   walkBadge = await WalkBadge.connect(shelter).deploy("WalkBadge","WB")
            
        // // request to mint one Badge, need to rename this function to checkLevel or something like that
        // await walkBadge.connect(shelter).requestBadge(walker.getAddress(),ethers.BigNumber.from("12"),ethers.BigNumber.from("32"),ethers.BigNumber.from(1)); //this should eventually be an API call

        // //get the supposed owner of token 0
        // const ownerAddress = await walkBadge.connect(shelter).ownerOf(ethers.BigNumber.from(0))
        // //get the struct at position 0, which should represent token 0
        // const badgeData = await walkBadge.connect(shelter).getBadge(ethers.BigNumber.from(0),ethers.BigNumber.from(1),walker.getAddress())
        
        // //print struct data
        // console.log(`Owner of token 0 is ${badgeData[0]} with:
        //                 Level of ${badgeData[1]}
        //                 Total time walked of ${badgeData[2]}
        //                 Total distance walked of ${badgeData[3]}
        //                 Total dogs walked of ${badgeData[4]}`)
        
        // //check addresses match
        // expect(ownerAddress).to.equal(badgeData[0]);
    });

    //Andrew will do
    xit("walker use walktokens to redeem real money (USDT)", async () => {
        //so maybe 100 walkTokens is $1
        //we need to integrate AAVE, to use their deposit and withdrawal system.
    });
})