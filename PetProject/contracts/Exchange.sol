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

// import "./DogToy.sol";

contract WalkTokenExchange is ReentrancyGuard {
    using SafeMath for uint256;

    address shelter;
    IERC20 private IERC20Dai;
    IERC20 private IERC20WT;
    ILendingPool private ILP;
    // ERC721ToyNFT private ToyNFT;

    uint256 newToyCost = 0.001 ether;

    event redeemedDai(
        address spender,
        uint256 amount,
        string action,
        uint256 time
    );
    event boughtToy(
        address spender,
        uint256 amount,
        string action,
        uint256 time
    );

    constructor(
        address _WT,
        address _Dai,
        address _ILP // address _ToyNFT
    ) public {
        shelter = msg.sender;
        IERC20Dai = IERC20(_Dai);
        IERC20WT = IERC20(_WT);
        ILP = ILendingPool(_ILP);
        // ToyNFT = ERC721ToyNFT(_ToyNFT);
    }

    function recieveWT(uint256 _value) public {
        //must have approval first from owner address to this contract address
        IERC20WT.transferFrom(msg.sender, address(this), _value);
        //should we burn here? IERC20WT.burn(_value)?
    }

    function recieveDai(uint256 _value) external {
        require(msg.sender == shelter, "only shelter can deposit Dai");
        //must have approval first from owner address to this contract address
        IERC20Dai.transferFrom(msg.sender, address(this), _value);
    }

    function withdrawDai(uint256 _value) external {
        require(msg.sender == shelter, "only shelter can withdraw Dai");
        IERC20Dai.approve(msg.sender, _value);
        IERC20Dai.transferFrom(address(this), msg.sender, _value);

        //eventually need a function in here that calls for withdrawAAVE too
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    // If at some point shelter sends too much ETH to the contract.
    function withdrawETH(address payable _to) public payable {
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
        IERC20Dai.approve(address(ILP), _value);
        ILP.deposit(address(IERC20Dai), _value, address(this), 0); //asset, amount, receiver of aDai, referral code
    }

    function withdrawAAVE(uint256 _value, address _redeeemer) internal {
        ILP.withdraw(address(IERC20Dai), _value, _redeeemer);
    }

    function redeemWTforDai(uint256 _DaitoRedeem) external {
        uint256 balanceWT = IERC20WT.balanceOf(msg.sender);
        uint256 WTneeded = _DaitoRedeem.mul(100); //100 WT are worth 1 Dai 200*100 = 20000

        require(
            balanceWT >= WTneeded,
            "Insufficient walkTokens to redeem with. 100 WT are worth 1 Dai"
        );
        recieveWT(WTneeded);

        uint256 contractBalanceDai = IERC20Dai.balanceOf(address(this));
        if (contractBalanceDai < _DaitoRedeem) {
            withdrawAAVE(_DaitoRedeem, msg.sender); //withdraw only required amount. later this should be always like 30% of dai is redeemable, or some fraction of all walktokens not owned by shelter.
        }

        emit redeemedDai(msg.sender, WTneeded, "Redeemed Dai", block.timestamp);
    }

    // //for when a new batch of toys is made to mint
    // function newToy(address _ToyNFT) external {
    //     require(msg.sender == shelter);
    //     ToyNFT = ERC721ToyNFT(_ToyNFT);
    // }

    // function buyDogToyNFT(string calldata name) external payable {
    //     require(msg.value == newToyCost, "need more tokens to buy this toy");
    //     string calldata action = "Buy new doggy toy";
    //     bool toyBought = ToyNFT.buyToy(name);
    //     require(toyBought, "toy is out of stock");
    //     emit boughtToy(msg.sender, msg.value, action, now);
    // }
}
