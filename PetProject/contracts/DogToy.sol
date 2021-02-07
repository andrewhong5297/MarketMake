//buyable NFTs such as ACC swag (shirts, collars, etc)
//need a struct, creation of struct function, and a specialized mint function that uses _safeMint().
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DogToy is ERC721 {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    address exchange;
    address shelter;
    uint256 toyBatchSize = 20;
    Counters.Counter private _tokenIds;

    constructor() public ERC721("DogToyTokenBatch", "DTT") {
        shelter = msg.sender;
    }

    event NewToy(uint256 toyId, string name);

    struct Toy {
        string name;
    }

    Toy[] public toys;

    function setExchange(address _exchange) external {
        require(msg.sender == shelter);
        exchange = _exchange;
    }

    function buyToy(address walker, string calldata _name)
        external
        returns (bool)
    {
        require(
            msg.sender == exchange,
            "Only the exchange can mint new Dog Toys"
        );
        require(toys.length <= toyBatchSize, "20 toys have already been sold");
        toys.push(Toy(_name));
        _tokenIds.increment();
        uint256 toyId = _tokenIds.current();
        _safeMint(walker, toyId);
        emit NewToy(toyId, _name);
        return true;
    }

    function getToysMinted() external returns (uint256) {
        return toys.length;
    }
}
