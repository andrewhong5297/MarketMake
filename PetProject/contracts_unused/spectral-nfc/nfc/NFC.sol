// SPDX-License-Identifier: agpl-3.0

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import {IScorerRegistry} from "../interfaces/IScorerRegistry.sol";
import {INFC} from "../interfaces/INFC.sol";
import {IERC20} from "../dependencies/openzeppelin/contracts/IERC20.sol";
import "./typesLibrary.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title NFC
/// @author Andrew
/// @notice Manages the creation and update of scores for a certain user, after they have gone through the bundling process in spectral frontend.
/// @dev Relies on scorer registry contract for oracle endpoint details.
contract NFC is ERC721, ChainlinkClient, INFC {
    using Counters for Counters.Counter;

    //===============Variables Init===============
    address public registry; //registry with all oracle endpoints
    address public owner; //deployer of contract
    address public link; //address of chainlink token

    Counters.Counter private _tokenIds;

    //@todo: this should be settable by governance. Also MIN_TICK and MAX_TICK may depend on scorer in the future
    uint256 MIN_TICK = 350;
    uint256 MAX_TICK = 800;
    uint256 MIN_TICKSIZE = 50;
    uint256 MAX_TICKSIZE = 300;

    //this is for chainlink callback function
    struct ReqResponse {
        uint32 _tokenId;
        uint256 _tickSet;
        bytes32 _scorer;
    }

    struct tickData {
        uint256 _lastUpdated;
        uint256 _tick;
    }

    mapping(uint32 => address) private _originalOwner;
    mapping(uint256 => uint256[]) private _tickSet_tickEnds;
    mapping(uint256 => mapping(uint32 => mapping(bytes32 => tickData)))
        private _tickSet_tokenId_scorer_tick;
    mapping(bytes32 => ReqResponse) private _reqId_tick;

    mapping(uint32 => bytes32) public tokenId_hash;
    mapping(bytes32 => uint32) public hash_tokenId;

    //===============Events===============
    /// @notice emitted upon callback function of chainlink call. emits the tokenId that was updated, the time it was updated, for which scorer (from registry), and the tick that was returned
    event ScoreUpdated(
        uint256 indexed tokenId,
        uint256 lastUpdated,
        bytes32 scorer,
        uint256 tick
    );

    /// @notice a new tickset can be created by anyone as long as it fits the governance values. emits the tickSetId as well the tickEnds (upper boundary per tick)
    event TickSetCreated(uint256 indexed tickSetId, uint256[] tickEnds);

    //===============Token/System Functions===============
    constructor(address _linkTokenAddress)
        public
        ERC721("Non-fungible Credit", "NFC")
    {
        owner = msg.sender;
        setPublicChainlinkToken(); //commented out for testing
        link = address(_linkTokenAddress);
    }

    /// @notice Changes the registry address that is referenced in oracle calls
    /// @param _registry is the scorer regsitry contract being used to store oracle endpoints
    function setRegistry(address _registry) external {
        require(owner == msg.sender);
        registry = _registry;
    }

    /// @notice Once a bundle has been created in the spectral frontend, this mint can be called with the tokenId hash
    /// @param tokenHash is the bytes32 hash produced by the NFC API "hash" endpoint.
    function mintToken(bytes32 tokenHash) external override {
        require(hash_tokenId[tokenHash] == 0);

        //will need to set tokenURI based on gen art later
        _tokenIds.increment();
        uint32 tempId = uint32(_tokenIds.current());
        tokenId_hash[tempId] = tokenHash;
        hash_tokenId[tokenHash] = tempId;

        _safeMint(_msgSender(), tempId);
        _originalOwner[tempId] = _msgSender();
    }

    /// @notice used to check the original owner of a tokenId
    /// @param tokenId is the uint32 representation of the bytes32 hash
    /// @return address of the original owner who minted that tokenId
    function getOriginalOwner(uint32 tokenId)
        public
        view
        override
        returns (address)
    {
        require(_exists(tokenId));
        return _originalOwner[tokenId];
    }

    /// @notice this burns the token from existence. You can't remint for the same hash, so the users should be aware burning means the bundle must be deleted from the API as well.
    /// @param tokenHash bytes32 hash of the original tokenId
    function burnToken(bytes32 tokenHash) external override {
        uint32 tokenId = uint32(uint256(tokenHash));
        require(msg.sender == getOriginalOwner(tokenId));
        _burn(tokenId);
    }

    /// @notice used to check that a certain tokenId is held by the original owner who minted it.
    /// @param _tokenId is the uint32 representation of the bytes32 hash
    /// @return bool of if the owner of the tokenId is the original owner or not
    function isOriginalOwner(uint32 _tokenId)
        external
        view
        override
        returns (bool)
    {
        require(_exists(_tokenId));
        return _originalOwner[_tokenId] == ownerOf(_tokenId);
    }

    //===============Tick Functions===============
    /// @notice create a new tickset with tickends for use in lending pools and other protocols.
    /// @param _tickSet is the new tick set id to be used to reference this set of tick ends
    /// @param _tickEnds (upper boundaries) for each tick in the tick set
    /// @return true if creation worked out
    function createTickSet(uint256 _tickSet, uint256[] memory _tickEnds)
        public
        override
        returns (bool)
    {
        //ticks cannot be changed/updated after creation, this needs to be a frontend warning
        require(_tickSet_tickEnds[_tickSet].length == 0);
        require(
            _tickEnds[0] > MIN_TICK &&
                _tickEnds[_tickEnds.length - 1] <= MAX_TICK,
            "bounds fail"
        );
        for (uint256 i = 0; i < _tickEnds.length - 1; i++) {
            if (
                _tickEnds[i + 1] - _tickEnds[i] < MIN_TICKSIZE ||
                _tickEnds[i + 1] - _tickEnds[i] > MAX_TICKSIZE
            ) {
                revert("size fail");
            }
        }
        _tickSet_tickEnds[_tickSet] = _tickEnds;
        emit TickSetCreated(_tickSet, _tickEnds);
        return true;
    }

    /// @notice update the tick for a certain tickset and scorer (from registry)
    /// @param _tokenId is the uint32 representation of the bytes32 hash
    /// @param _tickSet is the tick set id to be used to reference this set of tick ends
    /// @param _scorerId is the hash that is used as a key to get oracle parameters from scorer registry
    function updateHolderTick(
        uint32 _tokenId,
        uint256 _tickSet,
        bytes32 _scorerId
    ) external payable override {
        payForUpdate(_tokenId, _tickSet, _scorerId);
        IScorerRegistry reg = IScorerRegistry(registry);
        (address oracle, bytes32 jobID, uint256 fee) = reg.getScorerEndpoints(
            _scorerId
        );
        Chainlink.Request memory req = buildChainlinkRequest(
            jobID,
            address(this),
            this.callback.selector
        );
        // this may be needed if adapter cannot take in two params
        // string memory inputStr = typesLibrary.append(
        //   typesLibrary.bytes32ToString(tokenId_hash[_tokenId]),
        //   typesLibrary.uint2str(_tickSet)
        // );
        req.add(
            "tokenId",
            typesLibrary.bytes32ToString(tokenId_hash[_tokenId])
        );
        req.add("tickSetId", typesLibrary.uint2str(_tickSet));

        //must include a msg.value of LINK price 0.01?
        bytes32 reqId = sendChainlinkRequestTo(oracle, req, fee);
        _reqId_tick[reqId] = ReqResponse(_tokenId, _tickSet, _scorerId);
    }

    //chainlink oracle function callback
    function callback(bytes32 _requestId, uint256 _tickResponse)
        public
        recordChainlinkFulfillment(_requestId)
    {
        ReqResponse memory response = _reqId_tick[_requestId];
        require(
            _tickResponse < _tickSet_tickEnds[response._tickSet].length,
            "invalid tick returned"
        );

        //need to check tickResponse is within # of ticks in tickset
        _tickSet_tokenId_scorer_tick[response._tickSet][response._tokenId][
            response._scorer
        ] = tickData(uint32(_tickResponse), block.timestamp);
        emit ScoreUpdated(
            _tickResponse,
            block.timestamp,
            response._scorer,
            _tickResponse
        );
    }

    /// @notice contract owner to withdraw ETH
    /// @param _amount amount of ETH to be withdrawn
    function withdrawETH(uint256 _amount) external override {
        require(msg.sender == owner);
        //transfer value with call
        (bool sent, bytes memory data) = address(this).call{value: _amount}("");
        require(sent);
    }

    /// @notice payment for calling the oracle. This scales linearly from 0 to 0.001 ETH, based on how recently you have called for an update on this tick.
    /// @dev params are auto inputted by oracle call function. currently, the problem here is that they could still spam for each scorer/tickset. We might not want to subsidize that many.
    function payForUpdate(
        uint32 _tokenId,
        uint256 _tickSet,
        bytes32 _scorerId
    ) internal {
        uint256 lastUpdatedTimeDifference = 1209600 -
            block.timestamp -
            _tickSet_tokenId_scorer_tick[_tickSet][_tokenId][_scorerId]
                ._lastUpdated; //two weeks - time since last update
        if (lastUpdatedTimeDifference <= 0) {
            lastUpdatedTimeDifference = 0;
        }
        uint256 requiredAmount = mulDiv(
            1 * 10e15,
            lastUpdatedTimeDifference,
            1209600
        ); //if it's been more than last updated, then pay nothing. Otherwise, pay scaled fee.
        require(msg.value >= 1 * 10e15); //0.001 ETH
        (bool sent, bytes memory data) = msg.sender.call{value: msg.value}("");
        require(sent);
    }

    /// @notice contract owner to deposit LINK for oracle calls
    /// @param amount amount of LINK to be deposited
    function depositLINK(uint256 amount) public override {
        IERC20 token = IERC20(link);
        require(msg.sender == owner);
        require(token.allowance(msg.sender, address(this)) >= amount);
        bool sent = token.transferFrom(msg.sender, address(this), amount);
        require(sent);
    }

    /// @notice contract owner to withdraw LINK
    /// @param amount amount of LINK to be withdrawn
    function withdrawLINK(uint256 amount) external override {
        require(msg.sender == owner);
        IERC20 token = IERC20(link);
        bool sent = token.transfer(msg.sender, amount);
        require(sent);
    }

    //===============Get Tick Functions===============

    /// @notice get boundaries for a certain tickset
    /// @param _ticksetId is the tick set id to be used to reference this set of tick ends
    function getTickSet(uint256 _ticksetId)
        external
        view
        override
        returns (uint256[] memory tickSet)
    {
        tickSet = _tickSet_tickEnds[_ticksetId];
    }

    //get single tick returned
    function getTick(
        bytes32 _scorer,
        uint32 _tokenId,
        uint256 _tickset
    ) external view override returns (uint256 tick, uint256 lastUpdated) {
        tickData memory ticks = _tickSet_tokenId_scorer_tick[_tickset][
            _tokenId
        ][_scorer];
        tick = ticks._tick;
        lastUpdated = ticks._lastUpdated;
    }

    //get tokenID from token hash
    function getHashTokenId(bytes32 _tokenHash)
        external
        view
        override
        returns (uint32)
    {
        return hash_tokenId[_tokenHash];
    }

    /// @notice These bottom two functions manage percentage multiplication, and come from https://medium.com/coinmonks/math-in-solidity-part-3-percents-and-proportions-4db014e080b1
    /// @dev the way to think about this is x * y/z. Essentially y and z form the percentage, x is what we want to multiply by.
    /// @param x the nominal value we want to take the percentage of
    /// @param y the numerator for the percentage fraction
    /// @param z the denominator for the percentage function
    /// @return returns the percentage multiple of x based on y/z
    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 z
    ) public pure returns (uint256) {
        (uint256 l, uint256 h) = fullMul(x, y);
        require(h < z);
        uint256 mm = mulmod(x, y, z);
        if (mm > l) h -= 1;
        l -= mm;
        uint256 pow2 = z & -z;
        z /= pow2;
        l /= pow2;
        l += h * ((-pow2) / pow2 + 1);
        uint256 r = 1;
        r *= 2 - z * r;
        r *= 2 - z * r;
        r *= 2 - z * r;
        r *= 2 - z * r;
        r *= 2 - z * r;
        r *= 2 - z * r;
        r *= 2 - z * r;
        r *= 2 - z * r;
        return l * r;
    }

    function fullMul(uint256 x, uint256 y)
        public
        pure
        returns (uint256 l, uint256 h)
    {
        uint256 mm = mulmod(x, y, uint256(-1));
        l = x * y;
        h = mm - l;
        if (mm < l) h -= 1;
    }
}
