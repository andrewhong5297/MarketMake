pragma solidity ^0.7.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WalkToken is ERC20 {
    constructor(uint256 initialSupply) public ERC20("WalkToken", "WT") {
        _mint(msg.sender, initialSupply); //msg.sender returns a public address
        // console.log(`Minted ${initialSupply} to ${msg.sender}`);
    }

    function mint(uint256 _newSupply) external {
        _mint(msg.sender, _newSupply);
    }
}
