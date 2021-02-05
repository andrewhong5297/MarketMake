pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract stringtest {
    using SafeMath for uint256;
    uint256 public set_var;
    bytes32 public result_bytes_pub;

    function sliceInt(uint256 _int) external {
        bytes32 result_bytes = stringToBytes32(uint2str(_int));
        result_bytes_pub = result_bytes;
        uint256 _sliced = sliceBytes(result_bytes, 1, 6); //in this case, int losses first two 0s. fine for demo but will be problem later maybe.
        set_var = _sliced.div(10**18);
    }

    // function convert(uint256 n) internal returns (bytes32) {
    //     console.log(n);
    //     return bytes32(n);
    // }

    function sliceBytes(
        bytes32 _toSlice,
        uint256 start,
        uint256 end
    ) public returns (uint256 _sliced) {
        string memory _sliceable = bytes32ToString(_toSlice);
        console.log("bytes to string ", _sliceable);
        string memory slicedStr = getSlice(start, end, _sliceable);
        console.log("string slice ", slicedStr);
        uint256 _sliced = stringToUint(slicedStr);
        console.log("string to int ", _sliced);
        set_var = _sliced.div(10**18);
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
        // console.log("in getSlice: ", a);
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

    function stringToBytes32(string memory source)
        public
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    ////address to string int for inputting address into chainlink. Chainklink will then change the number to a hexidecimal address in the query.
    // function otherAddressToString(address _add)
    //     external
    //     view
    //     returns (string memory _addstring)
    // {
    //     console.log("address version, ", _add);
    //     uint256 ethAddressAsInt = uint256(_add);
    //     console.log("int version, ", ethAddressAsInt);
    //     string memory stringEthAdd = uint2str(ethAddressAsInt);
    //     console.log("string version, ", stringEthAdd);
    //     // console.log("bytes version, ", bytes(_add));

    //     // string memory finalOutput =
    //     //     "0x" + BigInt(ethAddressAsInt).toString(16).padStart(40, "0");

    //     // console.log("string version, ", ethAddressAsInt);
    //     return stringEthAdd;
    // }

    // function addressToString(address _pool)
    //     public
    //     pure
    //     returns (string memory _uintAsString)
    // {
    //     uint256 _i = uint256(_pool);
    //     if (_i == 0) {
    //         return "0";
    //     }
    //     uint256 j = _i;
    //     uint256 len;
    //     while (j != 0) {
    //         len++;
    //         j /= 10;
    //     }
    //     bytes memory bstr = new bytes(len);
    //     uint256 k = len - 1;
    //     while (_i != 0) {
    //         bstr[k--] = bytes1(uint8(48 + (_i % 10)));
    //         _i /= 10;
    //     }
    //     return string(bstr);
    // }

    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + (j % 10)));
            j /= 10;
        }
        str = string(bstr);
    }
}
