//buyable NFTs such as ACC swag (shirts, collars, etc)
//need a struct, creation of struct function, and a specialized mint function that uses _safeMint(). 
pragma solidity >=0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721ToyNFT is ERC721 {
  using SafeMath for uint256;

  event NewToy(uint toyId, string name);

  struct Toy {
    string name;
  }

  Toy[] public toys;

  function buyToy(string _name) public returns (bool) {
    /*
    This function creates a new toy object, associates it with an ID
    mints it as a token, and emits a NewToy event
    */
   if toys.length <= 20 {
     uint toyId = toys.push(Toy(_name)) - 1;
     _safeMint(msg.sender, toyId);
     emit NewToy(toyId, _name, msg.value);
     return true;
   } else {
     return false;
  }

  modifier isOwnerOf(uint _toyId) {
    require(msg.sender == ownerOf(_toyId));
    _;
  }

  function changeName(uint _toyId, string calldata _newName) external isOwnerOf(_toyId) {
    toys[_toyId].name = _newName;
  }
}
