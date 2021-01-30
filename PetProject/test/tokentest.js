const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Test", function () {
    let walkToken;
    let shelter, mochi, walker;
  
    it("deploy factory contracts", async function () {
       [shelter, mochi, walker] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each
    //shelter address 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266. it is basically a wallet, like your metamask. 

       const WalkToken = await ethers.getContractFactory(
        "WalkToken"
      );
      walkToken = await WalkToken.connect(shelter).deploy(ethers.BigNumber.from("20000000000"));
      await walkToken.deployed();

      const balance = await walkToken.connect(shelter).balanceOf(shelter.getAddress());
      const totalSupply = await walkToken.connect(shelter).totalSupply();
    //   await walkToken.connect(shelter)._mint(ethers.BigNumber.from("10")) //private function

      console.log("shelter balance of WalkToken: ", balance.toString());
      console.log("total supply of WalkToken: ", totalSupply.toString());
    })  

    it("mochi tries minting", async () => {
        await walkToken.connect(mochi).mint(ethers.BigNumber.from("1000")) //should fail
        const balance = await walkToken.connect(mochi).balanceOf(mochi.getAddress());
        console.log("mochi balance of WalkToken: ", balance.toString());
    });
    
    it("shelter tries to mint", async () => {
        await walkToken.connect(shelter).mint(ethers.BigNumber.from("1000")) //should work
        const balance2 = await walkToken.connect(shelter).balanceOf(shelter.getAddress());
        console.log("shelter balance of WalkToken: ", balance2.toString());
    })

    it("pay walker for walking mochi for 300 minutes", async () => {
        const walkedAmount=300; //this could be an API call to Wag's app holding data on walks
        const distanceTraveled=20; //miles
        const totalPayout = walkedAmount*distanceTraveled;

        await walkToken.connect(shelter).transfer(walker.getAddress(), ethers.BigNumber.from(totalPayout));
        const balance = await walkToken.connect(walker).balanceOf(walker.getAddress());
        console.log("walker balance of WalkToken: ", balance.toString());

        const balance2 = await walkToken.connect(shelter).balanceOf(shelter.getAddress());
        console.log("shelter balance of WalkToken: ", balance2.toString());

        const totalSupply = await walkToken.connect(shelter).totalSupply();
        console.log("total supply of WalkToken: ", totalSupply.toString());
    })

    xit("walker pays walktokens for NFT", async () => {
        //deploy NFT contract
        //exchanging walkTokens for NFT (you can have a enum that tracks type of dog walked)
    });
})