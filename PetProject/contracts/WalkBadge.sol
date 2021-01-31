//earnable NFTs with levels
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract WalkBadge is ReentrancyGuard {
    using SafeMath for uint256;

    address public shelter; //default is 0x0

    struct WalkerLevel {
        address walker;
        uint256 level;
        uint256 timeWalked;
        uint256 distanceWalked;
        uint256 dogsWalked;
        //possibly other variables?
    }

    mapping(address => WalkerLevel) public AddresstoBadge;

    event newBadge(
        address walker,
        uint256 level,
        uint256 timeWalked,
        uint256 distanceWalked,
        uint256 dogsWalked,
        uint256 dateCreated
    );

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

    function requestBadge(
        address _walker,
        uint256 _distanceWalked,
        uint256 _timeWalked,
        uint256 _dogsWalked
    ) external nonReentrant {
        require(msg.sender == shelter, "only shelter can mint new badges");

        //undecided on if we make a sql query and insert it into the function, or if there should be an oracle connection.
        //Insert in function means shelter has to call this, oracle means walker can call this.
        //If shelter needs to call then this should be called every time a walk is finished.
        //Otherwise oracle request: (uint256 _distanceWalked, uint256 _timeWalked, uint256 _dogsWalked) = getWalkerStats(_walker);

        uint256 _level =
            calculateLevel(_distanceWalked, _timeWalked, _dogsWalked);

        console.log("current level: ", AddresstoBadge[_walker].level);
        console.log("calculated level: ", _level);

        if (AddresstoBadge[_walker].level > 0) {
            AddresstoBadge[_walker].level = _level;
            AddresstoBadge[_walker].timeWalked = _timeWalked;
            AddresstoBadge[_walker].distanceWalked = _distanceWalked;
            AddresstoBadge[_walker].dogsWalked = _dogsWalked;

            emit updatedBadge(
                AddresstoBadge[_walker].walker,
                AddresstoBadge[_walker].level,
                AddresstoBadge[_walker].timeWalked,
                AddresstoBadge[_walker].distanceWalked,
                AddresstoBadge[_walker].dogsWalked,
                block.timestamp
            );
        } else {
            WalkerLevel memory createdBadge =
                WalkerLevel(
                    _walker,
                    _level,
                    _timeWalked,
                    _distanceWalked,
                    _dogsWalked
                );

            AddresstoBadge[_walker] = createdBadge; //not sure how else to search for tokens held by Address

            emit newBadge(
                AddresstoBadge[_walker].walker,
                AddresstoBadge[_walker].level,
                AddresstoBadge[_walker].timeWalked,
                AddresstoBadge[_walker].distanceWalked,
                AddresstoBadge[_walker].dogsWalked,
                block.timestamp
            );
        }
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

    function getWalkerStats(address _oracle, uint256 jobID)
        external
        returns (
            uint256 timeWalked,
            uint256 distanceWalked,
            uint256 dogsWalked
        )
    {
        require(msg.sender == shelter, "only shelter can input data");
        //oracle call
        return (3, 97, 3);
    }

    function getBadge(address _walker)
        external
        view
        returns (WalkerLevel memory _badge)
    {
        return AddresstoBadge[_walker];
    }
}
