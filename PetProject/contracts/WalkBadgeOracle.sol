//earnable NFTs with levels
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "https://github.com/smartcontractkit/chainlink/evm-contracts/src/v0.6/ChainlinkClient.sol";

contract WalkBadgeOracle is ReentrancyGuard {
    using SafeMath for uint256;

    address public shelter; //default is 0x0
    address[] public assignedAddresses;

    address private oracle;
    uint256 private fee = 1000000000000000000;

    struct WalkerLevel {
        address walker;
        uint256 level;
        uint256 timeWalked;
        uint256 distanceWalked;
        uint256 dogsWalked;
        //possibly other variables?
    }

    mapping(address => WalkerLevel) public AddresstoBadge;

    event updatedBadge(
        address walker,
        uint256 level,
        uint256 timeWalked,
        uint256 distanceWalked,
        uint256 dogsWalked,
        uint256 dateUpdated
    );

    constructor() public {
        shelter = msg.sender;
    }

    /*for create and update. Flow must be createBadge first, then call updateWalkerStats. 
    Then can call updateWalkerStats and then updateBadge as many times as they want. Contract pays link for now, later is user.
    */
    function createBadge(address _walker) external nonReentrant {
        require(
            AddresstoBadge[_walker].level == 0,
            "badget has already been created"
        );
        WalkerLevel memory createdBadge = WalkerLevel(_walker, 1, 0, 0, 0);

        AddresstoBadge[_walker] = createdBadge; //not sure how else to search for tokens held by Address
        assignedAddresses.push(_walker);
    }

    function updateBadge(address _walker) external nonReentrant {
        require(
            AddresstoBadge[_walker].level >= 1,
            "badget has not been created"
        );
        require(msg.sender == shelter, "only shelter can mint new badges");

        uint256 _level =
            calculateLevel(_distanceWalked, _timeWalked, _dogsWalked);

        console.log("current level: ", AddresstoBadge[_walker].level);
        console.log("calculated level: ", _level);

        AddresstoBadge[_walker].level = _level;

        emit updatedBadge(
            AddresstoBadge[_walker].walker,
            AddresstoBadge[_walker].level,
            AddresstoBadge[_walker].timeWalked,
            AddresstoBadge[_walker].distanceWalked,
            AddresstoBadge[_walker].dogsWalked,
            block.timestamp
        );
    }

    function calculateLevel(
        uint256 _distanceWalked,
        uint256 _timeWalked,
        uint256 _dogsWalked
    ) internal returns (uint256 _level) {
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

    function updateWalkerStats(uint256 jobID, address _walker) public {
        // require(msg.sender == shelter, "only shelter can input data");
        require(
            AddresstoBadge[_walker].level >= 1,
            "badget has not been created"
        );
        Chainlink.Request memory req =
            buildChainlinkRequest(
                jobId,
                address(this),
                this.fulfillStats.selector
            );
        req.add("address", _walker);
        req.add("unix", 0); //this should be block.timestamp for payments later. Or maybe we can just take the difference between this new pay value and old pay value?
        sendChainlinkRequestTo(oracle, req, fee);
    }

    function fulfillStats(
        bytes32 _requestId,
        uint256[] memory results,
        address _walker
    ) public {
        //how do we even put _walker in here?
        //results[0]=walksum
        //results[1]=distancesum
        //results[2]=dogcount
        //results[3]=totalpayments //IERC20WT.payTo(_walker,_totalpaymentsdifference)
        //should use totalpayments to calculate a difference, which is how much should be paid to the walker.
        // AddresstoBadge[_walker].timeWalked = _timeWalked;
        // AddresstoBadge[_walker].distanceWalked = _distanceWalked;
        // AddresstoBadge[_walker].dogsWalked = _dogsWalked;
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
