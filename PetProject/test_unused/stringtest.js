const { expect } = require("chai");
const { ethers } = require("hardhat");
const { abi: abiDai } = require("../artifacts/contracts/Dai.sol/Dai.json");
const fs = require("fs"); 
function mnemonic() {
  return fs.readFileSync("./test/mnemonic.txt").toString().trim();
}

//make sure you have defaultnetwork on localhost, a hardhat node running
describe("string_Test", function () {
    let shelter, stringTest;

    it("test string with 0 at the start", async () => {
        [shelter, mochi, walker, walker_two] = await ethers.getSigners(); //jsonrpc signers from default 20 accounts with 10000 ETH each

        const StringTest = await ethers.getContractFactory(
            "stringtest"
          );
          stringTest = await StringTest.connect(shelter).deploy();
        await stringTest.deployed();

        const string1 = await stringTest.connect(shelter).otherAddressToString("0x0592229c68368C7Bd96AeF217bBCb66F7fCd2388")
        // const string2 = await stringTest.connect(shelter).addressToString("0xa55E01a40557fAB9d87F993d8f5344f1b2408072")
        console.log('0x' + BigInt(string1).toString(16).padStart(40, '0'));
    });

})

