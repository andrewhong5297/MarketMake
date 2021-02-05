pragma solidity >=0.4.0;
pragma experimental ABIEncoderV2;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./typesLibrary.sol";

contract oracleTest is ChainlinkClient {
    using SafeMath for uint256;

    uint256 public testReturn;
    uint256 public testRawReturn;

    IERC20 private IERC20Link;

    uint256 public fee;
    address public oracle;
    bytes32 public jobId;

    constructor() public {
        setPublicChainlinkToken(); //this HAS TO BE HERE
        oracle = address(0xf5A4036CA35B9C017eFA49932DcA4bc8cc781Aa4);
        jobId = "928ffd612ed442149b046d5f807c9146";
        fee = 2 * 10**18; // 2 LINK
    }

    function recieveLink(address _erc20, uint256 _value) external {
        // require(msg.sender == shelter, "only shelter can deposit Link");
        //must have approval first from owner address to this contract address
        IERC20Link = IERC20(_erc20);
        IERC20Link.transferFrom(msg.sender, address(this), _value);
    }

    function approveLinkSend(
        address _erc20,
        address _oracle,
        uint256 _value
    ) external {
        // require(msg.sender == shelter, "only shelter can deposit Link");
        //must have approval first from owner address to this contract address
        IERC20Link = IERC20(_erc20);
        IERC20Link.approve(_oracle, _value);
    }

    function testOracle() public {
        Chainlink.Request memory req =
            buildChainlinkRequest(
                jobId,
                address(this),
                this.fulfillStats.selector
            );
        req.add(
            "data",
            typesLibrary.addressToString(
                address(0xCA765911b4588508db72E999263115964c1A31D6)
            )
        );

        bytes32 _requestId = sendChainlinkRequestTo(oracle, req, fee);
    }

    function fulfillStats(bytes32 _requestId, uint256 results) public {
        testRawReturn = results;
        testReturn = typesLibrary.sliceInt(results).div(10**18); //returns uint 10**18 so need to divide to get right amount. Should give us 18700 or something like that
    }
}
