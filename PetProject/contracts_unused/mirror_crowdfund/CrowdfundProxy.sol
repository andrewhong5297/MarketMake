// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.4;

import {CrowdfundStorage} from "./CrowdfundStorage.sol";

interface ICrowdfundFactory {
    function mediaAddress() external returns (address);

    function logic() external returns (address);

    // ERC20 data.
    function parameters()
        external
        returns (
            address payable operator,
            address payable fundingRecipient,
            uint256 fundingCap,
            uint256 operatorPercent,
            string memory name,
            string memory symbol
        );
}

/**
 * @title CrowdfundProxy
 * @author MirrorXYZ
 */
contract CrowdfundProxy is CrowdfundStorage {
    constructor() {
        logic = ICrowdfundFactory(msg.sender).logic();
        // Crowdfund-specific data.
        (
            operator,
            fundingRecipient,
            fundingCap,
            operatorPercent,
            name,
            symbol
        ) = ICrowdfundFactory(msg.sender).parameters();
        // Initialize mutable storage.
        status = Status.FUNDING;
    }

    fallback() external payable {
        address _impl = logic;
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), _impl, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)

            switch result
                case 0 {
                    revert(ptr, size)
                }
                default {
                    return(ptr, size)
                }
        }
    }

    receive() external payable {}
}
