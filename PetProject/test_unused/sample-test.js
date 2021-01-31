const { expect } = require("chai");

describe("Greeter", function() {
  let greeter;

  it ("deploy", async () => {
    const Greeter = await ethers.getContractFactory("Greeter");
    greeter = await Greeter.deploy("Hello, world!");

    await greeter.deployed();
    console.log(greeter.functions)
  });

  it("Should return the new greeting once it's changed", async function() {
    expect(await greeter.greet()).to.equal("Hello, world!");
    console.log(await greeter.greet())

    await greeter.setGreeting("Hola, mundo!");
    expect(await greeter.greet()).to.equal("Hola, mundo!");
    console.log(await greeter.greet())
  });
});
