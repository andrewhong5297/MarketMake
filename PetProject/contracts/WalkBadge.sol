//earnable NFTs with levels
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract WalkBadge is ERC721, ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    address public shelter; //default is 0x0
    Counters.Counter public nonce;

    struct WalkerLevel {
        address walker;
        uint256 level;
        uint256 time;
        uint256 distance;
        uint256 dogs;
        //possibly other variables?
    }

    mapping(uint256 => WalkerLevel) public IDtoBadge;
    mapping(address => uint256[]) public AddresstoIDS;
    WalkerLevel[] public Badges;

    event newBadge(
        uint256 tokenId,
        address walker,
        uint256 level,
        uint256 time,
        uint256 distance,
        uint256 dogs
    );

    constructor(string memory _name, string memory _symbol)
        public
        ERC721(_name, _symbol)
    {
        shelter = msg.sender;
    }

    function createBadge(
        address _walker,
        uint256 _level, //do we want to represent with level? what would walkers want to earn?
        uint256 _time,
        uint256 _distance,
        uint256 _dogs
    ) internal {
        Badges.push(WalkerLevel(_walker, _level, _time, _distance, _dogs));
    }

    function getBadge(uint256 id)
        external
        view
        returns (WalkerLevel memory _badge)
    {
        return Badges[id];
    }

    function mint(
        address _walker,
        uint256 _distanceWalked, //remove later
        uint256 _timeWalked, //remove later
        uint256 _dogsWalked //remove later
    ) external nonReentrant {
        require(msg.sender == shelter, "only shelter can mint new badges");

        uint256 tokenId = nonce.current();
        nonce.increment(); //Note that ID starts at 0.

        //(uint256 _distanceWalked, uint256 _timeWalked, uint256 _dogsWalked) = getWalkerStats(_walker);

        uint256 _level =
            calculateLevel(_distanceWalked, _timeWalked, _dogsWalked);

        //insert if statement checking if this level badge has already been redeemed. ERC1155 might actually be better here.
        createBadge(_walker, _level, _timeWalked, _distanceWalked, _dogsWalked);
        _safeMint(_walker, tokenId);

        IDtoBadge[tokenId] = Badges[tokenId];
        AddresstoIDS[_walker].push(tokenId); //not sure how else to search for tokens held by Address

        emit newBadge(
            tokenId,
            Badges[tokenId].walker,
            Badges[tokenId].level,
            Badges[tokenId].time,
            Badges[tokenId].distance,
            Badges[tokenId].dogs
        );
    }

    function calculateLevel(
        uint256 _distanceWalked,
        uint256 _timeWalked,
        uint256 _dogsWalked
    ) internal returns (uint256 _level) {
        // uint256 sum =
        //     0.5 * _distanceWalked + 2 * _timeWalked + 1.5 * _dogsWalked; //use safemath here please

        //if statements of if sum is greater than 100, level 1, if greater than 200, level 2....
        uint256 level = 1;
        return level;
    }

    function getWalkerStats(address _oracle, uint256 jobID)
        external
        returns (
            uint256 time,
            uint256 distance,
            uint256 dogs
        )
    {
        require(msg.sender == shelter, "only shelter can input data");
        //oracle call or just use postgres API insertion from shelter address
        return (1, 2, 3);
    }
}
