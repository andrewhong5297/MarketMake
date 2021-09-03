const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi: abiWT } = require("../artifacts/contracts/mirror-token/MirrorWriteToken.sol/MirrorWriteToken.json");
const fs = require("fs");

function mnemonic() {
  return fs.readFileSync("./test/mnemonic.txt").toString().trim();
}

//make sure you've switched defaultnetwork to Kovan and put a mnemonic.txt file in the test folder
describe("rinkeby register test", function () {
  let wt

  it("register test", async () => {
    overrides = { gasPrice: 15, gasLimit: 2100000 }

    provider = new ethers.providers.InfuraProvider("rinkeby", {
      projectId: "9e181ea092734f8c885be4fd21bf3bc5",
      projectSecret: "3020840d98eb4be1aedb32bb4329b3f0"
    });

    owner = ethers.Wallet.fromMnemonic(mnemonic()); //walker mnem (needs to me main acc for oracle reasons)
    owner = await owner.connect(provider);

    wt = new ethers.Contract(
      "0x6e3fCbb6f5c0D206B061A04f92827C780EEc58b5",
      abiWT,
      owner)

    balance = await provider.getBalance(owner.getAddress())
    console.log(await owner.getAddress())
    console.log(balance.toString())

    // tx = await wt.connect(owner).approve("0x2Ae8c972fB2E6c00ddED8986E2dc672ED190DA06", ethers.BigNumber.from("100000"))
    // tx.wait(1)

    tx = await wt.connect(owner).register("ath", owner.getAddress(), overrides)
    tx.wait(1)

    // allowance = await wt.registrationCost(overrides)
    // console.log(allowance.toString())
  })
})