//walkToken can be used to buy Dai, unused Dai is deposited into AAVE to collect interest as aDai
//walkToken can also be used to buy or redeem NFTs

//https://kovan.etherscan.io/address/0xe0fba4fc209b4948668006b2be61711b7f465bae lending pool AAVE contract I think?
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AAVE/ILendingPool.sol";

contract WalkTokenExchange is ReentrancyGuard {
    using SafeMath for uint256;

    address shelter;
    address dai;
    address WT;
    IERC20 private IERC20Dai;
    IERC20 private IERC20WT;
    ILendingPool private ILP;

    constructor(
        address _WT,
        address _Dai,
        address _ILP
    ) public {
        shelter = msg.sender;
        dai = _Dai;
        WT = _WT;
        IERC20Dai = IERC20(_Dai);
        IERC20WT = IERC20(_WT);
        ILP = ILendingPool(_ILP);
    }

    function recieveWT(uint256 _value) public {
        //must have approval first from owner address to this contract address
        IERC20WT.transferFrom(msg.sender, address(this), _value);
    }

    function burnWT(uint256 _value) external {
        //? burn function in WT callable only by this contract?
    }

    function recieveDai(uint256 _value) external {
        //must have approval first from owner address to this contract address
        IERC20Dai.transferFrom(msg.sender, address(this), _value);
    }

    function sendDai(uint256 _value) internal {
        IERC20Dai.approve(msg.sender, _value);
        IERC20Dai.transferFrom(address(this), msg.sender, _value);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    // If at some point shelter sends too much ETH to the contract.
    function sendETH(address payable _to) public payable {
        require(msg.sender == shelter, "only shelter can withdraw ETH");
        // Send returns a boolean value indicating success or failure.
        // This function is not recommended for sending Ether.
        bool sent = _to.send(msg.value);
        require(sent, "Failed to send Ether");
    }

    //IAAVE here. 90% of tokens to be deposited here. Should be pausable.
    function depositAAVE(uint256 _value) external {
        require(
            msg.sender == shelter,
            "only shelter can adjust AAVE functions"
        );
        ILP.deposit(address(IERC20Dai), _value, address(this), 0);
    }

    function withdrawAAVE(uint256 _value) internal {
        require(
            msg.sender == shelter,
            "only shelter can adjust AAVE functions"
        );
        ILP.withdraw(address(IERC20Dai), _value, address(this));
    }

    //Joe to write this function
    //function buyNFT()
    //

    function redeemWTforDai(uint256 _WTtoRedeem) external {
        uint256 balanceWT = IERC20WT.balanceOf(msg.sender);
        require(
            _WTtoRedeem >= balanceWT,
            "Insufficient walkTokens to redeem with"
        );

        uint256 redeemableDai = balanceWT.div(100); //100 WT are worth 1 Dai

        uint256 contractBalanceDai = IERC20WT.balanceOf(address(this));
        if (contractBalanceDai < redeemableDai) {
            withdrawAAVE(redeemableDai.sub(contractBalanceDai)); //withdraw only required amount
        }
        recieveWT(_WTtoRedeem);
        sendDai(redeemableDai);
    }
}
