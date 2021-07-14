// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.4;

import {CrowdfundProxy} from "./CrowdfundProxy.sol";

/**
 * @title CrowdfundFactory
 * @author MirrorXYZ
 */
contract CrowdfundFactory {
    //======== Structs ========

    struct Parameters {
        address payable operator;
        address payable fundingRecipient;
        uint256 fundingCap;
        uint256 operatorPercent;
        string name;
        string symbol;
    }

    //======== Events ========

    event CrowdfundDeployed(
        address crowdfundProxy,
        string name,
        string symbol,
        address operator
    );

    //======== Immutable storage =========

    address public immutable logic;

    //======== Mutable storage =========

    // Gets set within the block, and then deleted.
    Parameters public parameters;

    //======== Constructor =========

    constructor(address logic_) {
        logic = logic_;
    }

    //======== Deploy function =========

    function createCrowdfund(
        string calldata name_,
        string calldata symbol_,
        address payable operator_,
        address payable fundingRecipient_,
        uint256 fundingCap_,
        uint256 operatorPercent_
    ) external returns (address crowdfundProxy) {
        parameters = Parameters({
            name: name_,
            symbol: symbol_,
            operator: operator_,
            fundingRecipient: fundingRecipient_,
            fundingCap: fundingCap_,
            operatorPercent: operatorPercent_
        });

        crowdfundProxy = address(
            new CrowdfundProxy{
                salt: keccak256(abi.encode(name_, symbol_, operator_))
            }()
        );

        delete parameters;

        emit CrowdfundDeployed(crowdfundProxy, name_, symbol_, operator_);
    }
}
