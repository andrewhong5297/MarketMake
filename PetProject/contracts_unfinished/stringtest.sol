pragma solidity >=0.6.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";

contract stringtest {
    function otherAddressToString(address _add)
        external
        view
        returns (string memory _addstring)
    {
        console.log("address version, ", _add);
        uint256 ethAddressAsInt = uint256(_add);
        console.log("int version, ", ethAddressAsInt);
        string memory stringEthAdd = uint2str(ethAddressAsInt);
        console.log("string version, ", stringEthAdd);
        // console.log("bytes version, ", bytes(_add));

        // string memory finalOutput =
        //     "0x" + BigInt(ethAddressAsInt).toString(16).padStart(40, "0");

        // console.log("string version, ", ethAddressAsInt);
        return stringEthAdd;
    }

    function addressToString(address _pool)
        public
        pure
        returns (string memory _uintAsString)
    {
        uint256 _i = uint256(_pool);
        if (_i == 0) {
            return "0";
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
