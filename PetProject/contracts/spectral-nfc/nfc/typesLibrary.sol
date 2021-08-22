// SPDX-License-Identifier: agpl-3.0

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/math/SafeMath.sol';

library typesLibrary {
  using SafeMath for uint256;

  function sliceInt(
    uint256 _int,
    uint256 start,
    uint256 end
  ) public pure returns (uint256) {
    bytes32 result_bytes = stringToBytes32(uint2str(_int));
    uint256 _sliced = sliceBytes(result_bytes, start, end); //in this case, int losses first two 0s. fine for demo but will be problem later maybe.
    return _sliced;
  }

  // function convert(uint256 n) internal returns (bytes32) {
  //     console.log(n);
  //     return bytes32(n);
  // }

  function sliceBytes(
    bytes32 _toSlice,
    uint256 start,
    uint256 end
  ) public pure returns (uint256) {
    string memory _sliceable = bytes32ToString(_toSlice);
    string memory slicedStr = getSlice(start, end, _sliceable);
    uint256 _sliced = stringToUint(slicedStr);
    return _sliced;
  }

  function getSlice(
    uint256 begin,
    uint256 end,
    string memory text
  ) internal pure returns (string memory) {
    bytes memory a = new bytes(end - begin + 1);
    for (uint256 i = 0; i <= end - begin; i++) {
      a[i] = bytes(text)[i + begin - 1];
    }
    // console.log("in getSlice: ", a);
    return string(a);
  }

  function stringToUint(string memory _amount) internal pure returns (uint256 result) {
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

  function bytes32ToString(bytes32 x) internal pure returns (string memory) {
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

  function stringToBytes32(string memory source) public pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly {
      result := mload(add(source, 32))
    }
  }

  //address to string int for inputting address into chainlink. Chainklink will then change the number to a hexidecimal address in the query.
  function otherAddressToString(address _add) external pure returns (string memory _addstring) {
    uint256 ethAddressAsInt = uint256(_add);
    string memory stringEthAdd = uint2str(ethAddressAsInt);
    return stringEthAdd;
  }

  function addressToString(address _pool) public pure returns (string memory _uintAsString) {
    uint256 _i = uint256(_pool);
    if (_i == 0) {
      return '0';
    }
    uint256 j = _i;
    uint256 len;
    while (j != 0) {
      len++;
      j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint256 k = len - 1;
    while (_i != 0) {
      bstr[k--] = bytes1(uint8(48 + (_i % 10)));
      _i /= 10;
    }
    return string(bstr);
  }

  function uint2str(uint256 _i) internal pure returns (string memory str) {
    if (_i == 0) {
      return '0';
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

  function append(string memory a, string memory b) external pure returns (string memory) {
    return string(abi.encodePacked(a, b));
  }
}
