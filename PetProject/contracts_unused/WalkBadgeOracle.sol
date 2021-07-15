pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "./WalkToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./typesLibrary.sol";

contract WalkBadgeOracle is ReentrancyGuard, ChainlinkClient {
    using SafeMath for uint256;

    address public shelter; //default is 0x0
    address[] public assignedAddresses;
    WalkToken private IERC20WT;
    IERC20 private IERC20Link;
    address public oracle;
    uint256 private fee; //0.1 link
    bytes32 private jobId;

    bytes32 public reqIDtest;

    string public encoded;
    uint256 public testReturn;

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

    event paidTo(address payee, uint256 amount, string action, uint256 time);
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
        setPublicChainlinkToken(); //this HAS TO BE HERE
        oracle = address(0xAA1DC356dc4B18f30C347798FD5379F3D77ABC5b); //0xf5A4036CA35B9C017eFA49932DcA4bc8cc781Aa4); patrick's oracle
        jobId = "27401bbd3c804b3a9a532e439bb10b8f"; //"38b8c67ffa3e4e3cb9487b616b8d4321";
        fee = 1 * 10**18; // 1 LINK
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

    function updateBadgeLevel(address _walker) external nonReentrant {
        require(
            AddresstoBadge[_walker].level >= 1,
            "badget has not been created"
        );

        uint256 _level = calculateLevel(_walker);
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

        if (sum > 112000) {
            return 3;
        } else if (sum > 30000 && sum < 112000) {
            return 2;
        } else if (sum > 3000 && sum < 30000) {
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

    function updateWalkerStats(address _walker) public {
        require(
            AddresstoBadge[_walker].level >= 1,
            "badge has not been created"
        );
        Chainlink.Request memory req =
            buildChainlinkRequest(
                jobId,
                address(this),
                this.fulfillStats.selector
            );
        req.add("dog", typesLibrary.addressToString(_walker)); //"31803877693398533056304374249487059501607363464");
        bytes32 reqId = sendChainlinkRequestTo(oracle, req, fee);
        reqIDtest = reqId;
        reqId_Address[reqId] = _walker;
    }

    function fulfillStats(bytes32 _requestId, uint256 results) public {
        testReturn = results; //typesLibrary.sliceInt(results, 1, 10);
        address _walker = reqId_Address[_requestId];
        /*
        results[0]=timesum
        results[1]=distancesum
        results[2]=dogcount
        results[3]=totalpayments
        */
        uint256 oldPay = AddresstoBadge[_walker].totalPaid;
        uint256 newPay = typesLibrary.sliceInt(results, 19, 24).div(10**2); //since the result is mul 100 since decimals aren't handled well.
        uint256 payOut = newPay.sub(oldPay);
        IERC20WT.payTo(payOut, _walker); //pay is reported in two decimals, so 10**16 instead of 10**18
        AddresstoBadge[_walker].timeWalked = typesLibrary
            .sliceInt(results, 1, 6)
            .div(10**18);
        AddresstoBadge[_walker].distanceWalked = typesLibrary
            .sliceInt(results, 7, 12)
            .div(10**18);
        AddresstoBadge[_walker].dogsWalked = typesLibrary
            .sliceInt(results, 13, 18)
            .div(10**18);
        AddresstoBadge[_walker].totalPaid = newPay;
        emit paidTo(_walker, payOut, "Walk Pay", block.timestamp);
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
