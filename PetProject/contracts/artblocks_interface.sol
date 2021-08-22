pragma solidity 0.8.4;

interface artblocks {
    function purchase(uint256 _projectId)
        external
        payable
        returns (uint256 _tokenId);
}
