const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Test", function () {
    let walkToken, walkBadge;
    let shelter, mochi, walker;
  
    it("deploy walkToken contract", async function () {
       [shelter, mochi, walker] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each
    //shelter address 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266. it is basically a wallet, like your metamask. 

       const WalkToken = await ethers.getContractFactory(
        "WalkToken"
      );
      walkToken = await WalkToken.connect(shelter).deploy(ethers.BigNumber.from("20000000000"));
      await walkToken.deployed();

      const balance = await walkToken.connect(shelter).balanceOf(shelter.getAddress());
      const totalSupply = await walkToken.connect(shelter).totalSupply();

      console.log("shelter balance of WalkToken: ", balance.toString());
      console.log("total supply of WalkToken: ", totalSupply.toString());
    })  

    it("mochi tries minting", async () => {
        await expect(walkToken.connect(mochi).mint(ethers.BigNumber.from("1000"))).to.be.revertedWith("only shelter can mint, not dogs"); //should fail
    });
    
    it("shelter tries to mint", async () => {
        await walkToken.connect(shelter).mint(ethers.BigNumber.from("1000")) //should work
        const balance2 = await walkToken.connect(shelter).balanceOf(shelter.getAddress());
        console.log("shelter balance of WalkToken: ", balance2.toString());
    })

    it("pay walker for walking mochi for 300 minutes", async () => {
        const walkedAmount=30; //this could be an API call to Wag's app holding data on walks
        const distanceTraveled=1; //miles
        const totalPayout = walkedAmount*distanceTraveled;

        await walkToken.connect(shelter).transfer(walker.getAddress(), ethers.BigNumber.from(totalPayout));
        const balance = await walkToken.connect(walker).balanceOf(walker.getAddress());
        console.log("walker balance of WalkToken: ", balance.toString());

        const balance2 = await walkToken.connect(shelter).balanceOf(shelter.getAddress());
        console.log("shelter balance of WalkToken: ", balance2.toString());

        const totalSupply = await walkToken.connect(shelter).totalSupply();
        console.log("total supply of WalkToken: ", totalSupply.toString());
    })

    //Andrew to write deploy exchange. NFT2 implementation on exchange. 
    xit("deploy Exchange contract", async () => {
        //...
    });

    //already done
    it("walker use walktokens redeem an NFT Achievement Badge", async () => {
        //deploy WalkBadge contract
        const WalkBadge = await ethers.getContractFactory(
            "WalkBadge"
          );
          walkBadge = await WalkBadge.connect(shelter).deploy("WalkBadge","WB")
            
        //mint one Badge, need to rename this function to checkLevel or something like that
        await walkBadge.connect(shelter).mint(walker.getAddress(),ethers.BigNumber.from("12"),ethers.BigNumber.from("32"),ethers.BigNumber.from(1)); //this should eventually be an API call

        //get the supposed owner of token 0
        const ownerAddress = await walkBadge.connect(shelter).ownerOf(ethers.BigNumber.from(0))
        //get the struct at position 0, which should represent token 0
        const badgeData = await walkBadge.connect(shelter).getBadge(ethers.BigNumber.from(0))
        
        //print struct data
        console.log(`Owner of token 0 is ${badgeData[0]} with:
                        Level of ${badgeData[1]}
                        Total time walked of ${badgeData[2]}
                        Total distance walked of ${badgeData[3]}
                        Total dogs walked of ${badgeData[4]}`)
        
        //check addresses match
        expect(ownerAddress == badgeData[0], "owner addresses don't match");
    });

    //Joe to recreate using WalkBadge as template
    xit("walker using walktokens to redeem NFTs that represent real world goods", async () => {
        //deploy WalkCoupon contract, redeem for shirts, services, etc. 
    });

    //Andrew will do
    xit("walker use walktokens to redeem real money (USDT)", async () => {
        //so maybe 100 walkTokens is $1
        //we need to integrate AAVE, to use their deposit and withdrawal system.
    });
})