const { expect } = require("chai");
const { ethers } = require("hardhat");

//make sure you have defaultnetwork on localhost, a hardhat node running
describe("NFC Full Test v1 Local", function () {
    let registry, nfc, typesLibrary, link;
    let owner, user;

    //create tickset, mint and use get functions for token
    it("deploy local testing contracts", async () => {
        [owner, user] = await ethers.getSigners(); //jsonrpc signers from default 20 account

        const DaiContract = await ethers.getContractFactory("Dai"); //contract name here
        link = await DaiContract.connect(owner).deploy(ethers.BigNumber.from("0"));
        await link.deployed()
        await link.connect(owner).mint(owner.getAddress(),ethers.BigNumber.from("100"))
        console.log("link at: ",link.address)

        const ScorerRegistry = await ethers.getContractFactory(
            "ScorerRegistry"
          );
        registry = await ScorerRegistry.connect(owner).deploy();
        await registry.deployed();
        console.log("registry at: ", registry.address)
        
        const TypesLibrary = await ethers.getContractFactory(
            "typesLibrary"
          );
        typesLibrary = await TypesLibrary.connect(owner).deploy(); 
        await typesLibrary.deployed()
        console.log("library at: ", typesLibrary.address)

        const NFC = await ethers.getContractFactory(
          "NFC"
        );
        nfc = await NFC.connect(owner).deploy(link.address); 
        await nfc.deployed()
        console.log("nfc address: ", nfc.address)
    });

    it("test registry update", async () => {
      await registry.connect(owner).addScorer("0x0000000000000000000000000000000000000000000000000000000061626364","0x0000000000000000000000000000000000000000000000000000000061626364",ethers.BigNumber.from("1"),"0x514910771AF9Ca656af840dff83E8264EcF986CA","test_scorer")
    })  

    it("set registry", async () => {
      await nfc.connect(owner).setRegistry(registry.address)
    })  

    it("create tickset", async () => {
      await nfc.connect(owner).createTickSet(ethers.BigNumber.from("1"),[ethers.BigNumber.from("450"),ethers.BigNumber.from("650")])
    })  

    it("mint token", async () => {
      await nfc.connect(user).mintToken("0x0000000000000000000000000000000000000000000000000000000099012344")

      const tokenIdint = await nfc.getHashTokenId("0x0000000000000000000000000000000000000000000000000000000099012344")
      console.log("tokenId: ", tokenIdint)
    })  

    xit("update score", async () => {
      nfc.connect(owner).updateHolderTick() //to be done after chainlink integration
    })  
})