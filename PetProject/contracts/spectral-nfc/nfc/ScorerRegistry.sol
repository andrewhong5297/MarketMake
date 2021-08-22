// SPDX-License-Identifier: agpl-3.0

pragma solidity 0.6.12;

import {Ownable} from '../dependencies/openzeppelin/contracts/Ownable.sol';
import {IScorerRegistry} from '../interfaces/IScorerRegistry.sol';

contract ScorerRegistry is Ownable, IScorerRegistry {
  struct Scorer {
    bytes32 jobID;
    uint256 fee;
    address oracleID;
    string name;
    bool active;
  }

  address private _governance;

  /**
   * Key is the lowercase name as bytes32
   */
  mapping(bytes32 => Scorer) public scorers;

  modifier authorized() {
    require(owner() == msg.sender || _governance == msg.sender);
    _;
  }

  function addScorer(
    bytes32 _id,
    bytes32 _jobID,
    uint256 _fee,
    address _oracleID,
    string memory _name
  ) external virtual override authorized() returns (bool success) {
    scorers[_id] = Scorer(_jobID, _fee, _oracleID, _name, true);
    return true;
  }

  function updateScorer(
    bytes32 _id,
    bytes32 _jobID,
    uint256 _fee,
    address _oracleID,
    string memory _name,
    bool active
  ) external virtual override authorized() returns (bool success) {
    scorers[_id] = Scorer(_jobID, _fee, _oracleID, _name, active);
    return true;
  }

  /**
   * We don't actually want to delete scorers, we just want to make them inactive
   */
  function removeScorer(bytes32 _id) external virtual override authorized() returns (bool success) {
    scorers[_id].active = false;
    return true;
  }

  function setGovernance(address _address) external virtual override onlyOwner {
    _governance = _address;
  }

  function getScorerEndpoints(bytes32 key)
    external
    view
    virtual
    override
    returns (
      address oracleID,
      bytes32 jobID,
      uint256 fee
    )
  {
    return (scorers[key].oracleID, scorers[key].jobID, scorers[key].fee);
  }
}
