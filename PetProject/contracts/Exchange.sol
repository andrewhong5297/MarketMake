//walkToken can be used to buy Dai, unused Dai is deposited into AAVE to collect interest as aDai
//walkToken can also be used to buy or redeem NFTs

//https://kovan.etherscan.io/address/0xe0fba4fc209b4948668006b2be61711b7f465bae lending pool AAVE contract I think?
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract WalkTokenExchange is ReentrancyGuard {
    address shelter;
    IERC20 private IERC20Dai;
    IERC20 private IERC20WT;

    constructor(address _WT, address _Dai) public {
        shelter = msg.sender;
        IERC20Dai = IERC20(_Dai);
        IERC20WT = IERC20(_WT);
    }

    //IAAVE here. 90% of tokens to be deposited here. Should be pausable.
    //deposit()
    //withdraw()

    function recieveERC20(uint256 _value) external {
        //must have approval first from owner address to this contract address
        IERC20WT.transferFrom(msg.sender, address(this), _value);
    }
}
