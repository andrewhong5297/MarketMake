const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Test", function () {
    let walkToken;
    let owner, bidder, auditor, funder;
  
    it("deploy factory contracts", async function () {
       [owner, mochi] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

       const WalkToken = await ethers.getContractFactory(
        "WalkToken"
      );
      walkToken = await WalkToken.connect(owner).deploy(ethers.BigNumber.from("20000000000"));

      await walkToken.deployed();

      const balance = await walkToken.connect(owner).balanceOf(owner.getAddress());
      console.log("Owner balance of WalkToken: ", balance.toString());
    })  

    it("someone else tries minting", async () => {
        walkToken.connect(mochi).mint(ethers.BigNumber.from("1000")) //should fail
    })
})