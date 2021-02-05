pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WalkToken is ERC20 {
    address public shelter; //default is 0x0
    address public badge;

    constructor(uint256 initialSupply) public ERC20("WalkToken", "WT") {
        shelter = msg.sender; //assigns deployer address to sheter
        badge = msg.sender; //default
        _mint(msg.sender, initialSupply); //msg.sender returns a public address
    }

    function changeBadge(address _badge) external {
        require(msg.sender == shelter);
        badge = _badge;
    }

    function mint(uint256 _newSupply) external {
        require(msg.sender == shelter, "only shelter can mint, not dogs");
        _mint(msg.sender, _newSupply);
    }

    function payTo(uint256 _newSupply, address _payee) external {
        // require(
        //     msg.sender == badge || msg.sender == shelter,
        //     "only shelter can mint, not dogs"
        // );
        _mint(_payee, _newSupply);
    }
}
