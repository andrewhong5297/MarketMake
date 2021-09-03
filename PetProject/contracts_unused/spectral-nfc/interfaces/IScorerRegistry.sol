// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

interface IScorerRegistry {
  function addScorer(
    bytes32 _id,
    bytes32 _jobID,
    uint256 _fee,
    address _oracleID,
    string memory _name
  ) external virtual returns (bool success);

  function updateScorer(
    bytes32 _id,
    bytes32 _jobID,
    uint256 _fee,
    address _oracleID,
    string memory _name,
    bool active
  ) external virtual returns (bool success);

  function removeScorer(bytes32 _id) external virtual returns (bool success);

  function setGovernance(address _address) external;

  function getScorerEndpoints(bytes32 key)
    external
    view
    returns (
      address oracleID,
      bytes32 jobID,
      uint256 fee
    );
}
