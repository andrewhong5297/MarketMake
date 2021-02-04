pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract oracleTest is ChainlinkClient {
    uint256 public testReturn;
    IERC20 private IERC20Link;

    function recieveLink(address _erc20, uint256 _value) external {
        // require(msg.sender == shelter, "only shelter can deposit Link");
        //must have approval first from owner address to this contract address
        IERC20Link = IERC20(_erc20);
        IERC20Link.transferFrom(msg.sender, address(this), _value);
    }

    function updateWalkerStats() public {
        address oracle = address(0xf5A4036CA35B9C017eFA49932DcA4bc8cc781Aa4);
        bytes32 jobID = "4bbac81fd56b4c98b6d6e794152c1c94";
        uint256 fee = 0.1 * 10**18;
        Chainlink.Request memory req =
            buildChainlinkRequest(
                jobID,
                address(this),
                this.fulfillStats.selector
            );
        sendChainlinkRequestTo(oracle, req, fee);
    }

    function fulfillStats(bytes32 _requestId, uint256 results) public {
        testReturn = results;
    }
}
