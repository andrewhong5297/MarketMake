pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract oracleTest is ChainlinkClient {
    using SafeMath for uint256;

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

    function fulfillStats(bytes32 _requestId, bytes32 results) public {
        testReturn = sliceBytes(results, 1, 7).div(10**18); //returns uint 10**18 so need to divide to get right amount. Should give us 18700 or something like that
    }

    ///string utils
    function sliceBytes(
        bytes32 _toSlice,
        uint256 start,
        uint256 end
    ) internal returns (uint256 _sliced) {
        string memory _sliceable = bytes32ToString(_toSlice);
        string memory slicedStr = getSlice(start, end, _sliceable);
        uint256 _sliced = stringToUint(slicedStr);
        return _sliced;
    }

    function getSlice(
        uint256 begin,
        uint256 end,
        string memory text
    ) internal returns (string memory) {
        bytes memory a = new bytes(end - begin + 1);
        for (uint256 i = 0; i <= end - begin; i++) {
            a[i] = bytes(text)[i + begin - 1];
        }
        return string(a);
    }

    function stringToUint(string memory _amount)
        internal
        returns (uint256 result)
    {
        bytes memory b = bytes(_amount);
        uint256 i;
        uint256 counterBeforeDot;
        uint256 counterAfterDot;
        result = 0;
        uint256 totNum = b.length;
        totNum--;
        bool hasDot = false;

        for (i = 0; i < b.length; i++) {
            uint256 c = uint256(uint8(b[i]));

            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
                counterBeforeDot++;
                totNum--;
            }

            if (c == 46) {
                hasDot = true;
                break;
            }
        }

        if (hasDot) {
            for (uint256 j = counterBeforeDot + 1; j < 18; j++) {
                uint256 m = uint256(uint8(b[j]));

                if (m >= 48 && m <= 57) {
                    result = result * 10 + (m - 48);
                    counterAfterDot++;
                    totNum--;
                }

                if (totNum == 0) {
                    break;
                }
            }
        }
        if (counterAfterDot < 18) {
            uint256 addNum = 18 - counterAfterDot;
            uint256 multuply = 10**addNum;
            return result = result * multuply;
        }

        return result;
    }

    function bytes32ToString(bytes32 x) internal returns (string memory) {
        bytes memory bytesString = new bytes(32);
        uint256 charCount = 0;
        for (uint256 j = 0; j < 32; j++) {
            bytes1 char = bytes1(bytes32(uint256(x) * 2**(8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint256 j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }
}
