// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

interface INFC {
  event ScoreUpdated(uint256 indexed tokenId, uint256 lastUpdated, bytes32 scorer, uint256 tick);
  event TickSetCreated(uint256 indexed tickSetId, uint256[] tickEnds);

  function mintToken(bytes32 ticket) external;

  function burnToken(bytes32 ticket) external;

  // function setTokenURI(string memory uri) external; //this still needs to be added in/managed somehow

  function getOriginalOwner(uint32 tokenId) external view returns (address);

  function isOriginalOwner(uint32 tokenId) external view returns (bool);

  function updateHolderTick(
    uint32 tokenId,
    uint256 tickSet,
    bytes32 scorerId
  ) external payable;

  function withdrawETH(uint256 _amount) external;

  function depositLINK(uint256 amount) external;

  function withdrawLINK(uint256 amount) external;

  function createTickSet(uint256 _tickSet, uint256[] memory _tickEnds) external returns (bool);

  function getTickSet(uint256 _ticksetId) external view returns (uint256[] memory tickSet);

  function getTick(
    bytes32 _scorer,
    uint32 _tokenId,
    uint256 _tickset
  ) external view returns (uint256, uint256);

  function getHashTokenId(bytes32 _tokenHash) external view returns (uint32);

  function getMultipleTicksForSingleUser(
    uint32 _tokenId,
    bytes32 _scorer,
    uint256[] memory _tickset
  ) external view returns (uint256[] memory, uint256[] memory);

  function getMultipleUsersTicks(
    bytes32 _scorer,
    uint32[] memory _tokenId,
    uint256 _tickset
  ) external view returns (uint256[] memory, uint256[] memory);
}
