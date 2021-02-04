pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";

contract stringtest {
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

    // function uint2str(uint256 _i) internal pure returns (string memory str) {
    //     if (_i == 0) {
    //         return "0";
    //     }
    //     uint256 j = _i;
    //     uint256 length;
    //     while (j != 0) {
    //         length++;
    //         j /= 10;
    //     }
    //     bytes memory bstr = new bytes(length);
    //     uint256 k = length;
    //     j = _i;
    //     while (j != 0) {
    //         bstr[--k] = bytes1(uint8(48 + (j % 10)));
    //         j /= 10;
    //     }
    //     str = string(bstr);
    // }
}
