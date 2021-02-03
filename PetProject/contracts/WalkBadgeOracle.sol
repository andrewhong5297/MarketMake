//earnable NFTs with levels
pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "./WalkToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WalkBadgeOracle is ReentrancyGuard, ChainlinkClient {
    using SafeMath for uint256;

    address public shelter; //default is 0x0
    address[] public assignedAddresses;
    WalkToken private IERC20WT;
    IERC20 private IERC20Link;
    address private oracle;
    uint256 private fee = 100000000000000000; //currently 10**17

    struct WalkerLevel {
        address walker;
        uint256 level;
        uint256 timeWalked;
        uint256 distanceWalked;
        uint256 dogsWalked;
        uint256 totalPaid;
    }

    mapping(address => WalkerLevel) public AddresstoBadge;
    mapping(bytes32 => address) public reqId_Address;

    event updatedBadge(
        address walker,
        uint256 level,
        uint256 timeWalked,
        uint256 distanceWalked,
        uint256 dogsWalked,
        uint256 dateUpdated,
        uint256 payUpdated
    );

    constructor(address _WT, address _link) public {
        shelter = msg.sender;
        IERC20WT = WalkToken(_WT);
        IERC20Link = IERC20(_link);
    }

    function recieveLink(uint256 _value) external {
        // require(msg.sender == shelter, "only shelter can deposit Link");
        //must have approval first from owner address to this contract address
        IERC20Link.transferFrom(msg.sender, address(this), _value);
    }

    /*for create and update. Flow must be createBadge first, then call updateWalkerStats. 
    Then can call updateWalkerStats and then updateBadge as many times as they want. Contract pays link for now, later is user.
    */
    function createBadge(address _walker) external nonReentrant {
        require(
            AddresstoBadge[_walker].level == 0,
            "badget has already been created"
        );
        WalkerLevel memory createdBadge = WalkerLevel(_walker, 1, 0, 0, 0, 0);

        AddresstoBadge[_walker] = createdBadge; //not sure how else to search for tokens held by Address
        assignedAddresses.push(_walker);
    }

    function updateBadge(address _walker) external nonReentrant {
        require(
            AddresstoBadge[_walker].level >= 1,
            "badget has not been created"
        );
        require(msg.sender == shelter, "only shelter can mint new badges");

        uint256 _level = calculateLevel(_walker);

        console.log("current level: ", AddresstoBadge[_walker].level);
        console.log("calculated level: ", _level);

        AddresstoBadge[_walker].level = _level;

        emit updatedBadge(
            AddresstoBadge[_walker].walker,
            AddresstoBadge[_walker].level,
            AddresstoBadge[_walker].timeWalked,
            AddresstoBadge[_walker].distanceWalked,
            AddresstoBadge[_walker].dogsWalked,
            AddresstoBadge[_walker].totalPaid,
            block.timestamp
        );
    }

    function calculateLevel(address _walker) internal returns (uint256 _level) {
        uint256 _distanceWalked = AddresstoBadge[_walker].distanceWalked;
        uint256 _timeWalked = AddresstoBadge[_walker].timeWalked;
        uint256 _dogsWalked = AddresstoBadge[_walker].dogsWalked;

        uint256 sum =
            _distanceWalked.mul(2).add(_timeWalked.div(2)).add(
                _dogsWalked.mul(10)
            );
        console.log("sum", sum);

        if (sum > 80) {
            return 2;
        } else if (sum > 30 && sum < 80) {
            return 1;
        } else {
            return 0;
        }
    }

    ///oracle stuff
    function setOracleAddress(address _oracle) external {
        require(msg.sender == shelter, "only shelter can change oracle");
        oracle = _oracle;
    }

    function updateWalkerStats(bytes32 jobID, address _walker) public {
        // require(msg.sender == shelter, "only shelter can input data");
        require(
            AddresstoBadge[_walker].level >= 1,
            "badget has not been created"
        );
        Chainlink.Request memory req =
            buildChainlinkRequest(
                jobID,
                address(this),
                this.fulfillStats.selector
            );
        req.add("address", toString(_walker));
        // req.add("unix", 0); //this should be block.timestamp for payments later. Or maybe we can just take the difference between this new pay value and old pay value?
        bytes32 reqId = sendChainlinkRequestTo(oracle, req, fee);
        reqId_Address[reqId] = _walker;
    }

    function fulfillStats(bytes32 _requestId, uint256[] memory results) public {
        //how do we even put _walker in here? also note these are all returning mul 100.
        address _walker = reqId_Address[_requestId];
        /*
        results[0]=timesum
        results[1]=distancesum
        results[2]=dogcount
        results[3]=totalpayments 
        */
        uint256 oldPay = AddresstoBadge[_walker].totalPaid;
        IERC20WT.payTo(results[3].sub(oldPay), _walker);
        AddresstoBadge[_walker].timeWalked = results[0];
        AddresstoBadge[_walker].distanceWalked = results[1];
        AddresstoBadge[_walker].dogsWalked = results[2];
        AddresstoBadge[_walker].totalPaid = results[3];
    }

    //need to get this working
    function toString(address account) public pure returns (string memory) {
        return toString(abi.encodePacked(account));
    }

    ////view functions
    function getBadge(address _walker)
        external
        view
        returns (WalkerLevel memory _badge)
    {
        return AddresstoBadge[_walker];
    }

    function getAllAddresses()
        external
        view
        returns (address[] memory addresses)
    {
        return assignedAddresses;
    }
}
