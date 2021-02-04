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

    function fulfillStats(bytes32 _requestId, string memory results) public {
        testReturn = sliceString(results); //returns uint
    }

    function sliceString(string calldata _toSlice)
        external view
        returns (uint256 _sliced)
    {
        string calldata slicedStr = _toSlice[:8];
        console.log(slicedStr);
        uint _sliced = stringToUint(slicedStr);
        console.log(_sliced);
        return _sliced;
    }

     function stringToUint(string memory _amount) internal view returns (uint result) {
    bytes memory b = bytes(_amount);
    uint i;
    uint counterBeforeDot;
    uint counterAfterDot;
    result = 0;
    uint totNum = b.length;
    totNum--;
    bool hasDot = false;

    for (i = 0; i < b.length; i++) {
        uint c = uint(uint8(b[i]));

        if (c >= 48 && c <= 57) {
            result = result * 10 + (c - 48);
            counterBeforeDot ++;
            totNum--;
        }

        if(c == 46){
            hasDot = true;
            break;
        }
    }

    if(hasDot) {
        for (uint j = counterBeforeDot + 1; j < 18; j++) {
            uint m = uint(uint8(b[j]));

            if (m >= 48 && m <= 57) {
                result = result * 10 + (m - 48);
                counterAfterDot ++;
                totNum--;
            }

            if(totNum == 0){
                break;
            }
        }
    }
     if(counterAfterDot < 18){
         uint addNum = 18 - counterAfterDot;
         uint multuply = 10 ** addNum;
         return result = result * multuply;
     }

     return result;
    }
}
