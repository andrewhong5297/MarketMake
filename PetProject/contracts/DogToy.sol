//buyable NFTs such as ACC swag (shirts, collars, etc)
//need a struct, creation of struct function, and a specialized mint function that uses _safeMint(). 
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ERC721ToyNFT is ERC721 {
  using SafeMath for uint256;
  using Counters for Counters.Counter;

  address exchange;
  uint toyBatchSize = 20;
  Counters.Counter private _tokenIds;

  constructor() public ERC721("DogToyTokenBatch", "DTT") {
    exchange = msg.sender;
  }

  event NewToy(uint toyId, string name);

  struct Toy {
    string name;
  }

  Toy[] public toys;

  function buyToy(address walker, string calldata _name) public returns (bool) {
    require(msg.sender==exchange, "Only the exchange can mint new Dog Toys");
    if (toys.length <= toyBatchSize) {
      toys.push(Toy(_name));
      _tokenIds.increment();
      uint toyId = _tokenIds.current();
      _safeMint(walker, toyId);
      emit NewToy(toyId, _name);
      return true;
    } else {
      return false;
    }
  }
}
