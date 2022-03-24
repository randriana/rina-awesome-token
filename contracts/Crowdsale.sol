pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Token.sol";
import "./Swap.sol";

import "hardhat/console.sol";

contract Crowdsale is Context, ReentrancyGuard, AccessControl {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    Token public token;
    Swap public swap;
    IERC20 public constant DAI =
        IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    address payable public wallet;
    address public treasury;
    address public swapToToken;

    bytes32 public constant MAINTAINER_ROLE = keccak256("MAINTAINER_ROLE");

    mapping(IERC20 => bool) acceptedStableCoins;

    uint256 public weiRaised;
    uint256 public rate;

    event TokensMinted(
        address indexed purchaser,
        uint256 value,
        uint256 amount
    );

    constructor(
        address payable _wallet,
        address _treasury,
        address _swapToToken,
        Token _token,
        Swap _swap,
        uint256 _initialRate
    ) {
        require(_wallet != address(0), "Wallet is the zero address");
        require(_treasury != address(0), "Treasury is zero address");
        require(_swapToToken != address(0), "SwapToToken is the zero address");
        require(address(_token) != address(0), "Token is the zero address");
        require(_initialRate > 0, "Rate cannot be 0");

        wallet = _wallet;
        token = _token;
        rate = _initialRate;
        swap = _swap;
        treasury = _treasury;
        swapToToken = _swapToToken;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

        //Add DAI
        acceptedStableCoins[
            IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F)
        ] = true;
    }

    function buyTokensWithETH() external payable nonReentrant {
        address beneficiary = msg.sender;

        _preValidatePurchase(beneficiary, msg.value);

        uint256 swappedAmount = _swapETH(msg.value);

        _forwardAndMint(swappedAmount, beneficiary, DAI);
    }

    function buyTokensWithStableCoin(uint256 amount, IERC20 stableCoin)
        external
        nonReentrant
    {
        require(acceptedStableCoins[stableCoin] == true, "Token not accepted");

        address beneficiary = msg.sender;

        _preValidatePurchase(beneficiary, amount);

        stableCoin.safeTransferFrom(beneficiary, address(this), amount);

        _forwardAndMint(amount, beneficiary, stableCoin);
    }

    function _forwardAndMint(
        uint256 amount,
        address beneficiary,
        IERC20 withToken
    ) private {
        _forwardToken(amount, withToken);

        uint256 amountToMint = _getTokenAmount(amount);

        // update state
        weiRaised = weiRaised.add(amount);

        _mint(beneficiary, amountToMint);

        emit TokensMinted(_msgSender(), amount, amountToMint);

        _updatePurchasingState(beneficiary, amount);

        _postValidatePurchase(beneficiary, amount);
    }

    receive() external payable {}

    function setRate(uint256 newRate) external onlyRole(MAINTAINER_ROLE) {
        rate = newRate;
    }

    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met.
     * Use `super` in contracts that inherit from Crowdsale to extend their validations.
     * Example from CappedCrowdsale.sol's _preValidatePurchase method:
     *     super._preValidatePurchase(beneficiary, weiAmount);
     *     require(weiRaised().add(weiAmount) <= cap);
     * @param beneficiary Address performing the token purchase
     * @param weiAmount Value in wei involved in the purchase
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount)
        internal
        view
        virtual
    {
        require(
            beneficiary != address(0),
            "Crowdsale: beneficiary is the zero address"
        );
        require(weiAmount != 0, "Crowdsale: weiAmount is 0");
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
    }

    /**
     * @dev Validation of an executed purchase. Observe state and use revert statements to undo rollback when valid
     * conditions are not met.
     * @param beneficiary Address performing the token purchase
     * @param weiAmount Value in wei involved in the purchase
     */
    function _postValidatePurchase(address beneficiary, uint256 weiAmount)
        internal
        view
        virtual
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Override for extensions that require an internal state to check for validity (current user contributions,
     * etc.)
     * @param beneficiary Address receiving the amountToMint
     * @param weiAmount Value in wei involved in the purchase
     */
    function _updatePurchasingState(address beneficiary, uint256 weiAmount)
        internal
        virtual
    {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Override to extend the way in which ether is converted to amountToMint.
     * @param weiAmount Value in wei to be converted into amountToMint
     * @return Number of amountToMint that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 weiAmount) private view returns (uint256) {
        return weiAmount.mul(rate) / 1 ether;
    }

    /**
     * @dev Determines how ETH is stored/forwarded on purchases.
     */
    function _forwardToken(uint256 amount, IERC20 tokenToForward) private {
        tokenToForward.transfer(address(wallet), amount);
    }

    function _mint(address to, uint256 tokenAmount) private {
        token.mint(to, tokenAmount);
    }

    function _swapETH(uint256 amount) private returns (uint256) {
        return swap.swapETH{value: amount}(swapToToken);
    }

    function addAcceptedStableCoin(IERC20 _stableCoin)
        external
        onlyRole(MAINTAINER_ROLE)
    {
        acceptedStableCoins[_stableCoin] = true;
    }

    function removeAcceptedStableCoin(IERC20 _stableCoin)
        external
        onlyRole(MAINTAINER_ROLE)
    {
        acceptedStableCoins[_stableCoin] = false;
    }

    function estimateMintAmountWithETH(uint256 amount)
        external
        returns (uint256)
    {
        uint256 estimatedSwap = swap.estimateETHSwap(amount, swapToToken);
        uint256 amountToMint = _getTokenAmount(estimatedSwap);
        uint256 mintingFee = token.calculateMintingFee(amountToMint);
        return amountToMint - mintingFee;
    }

    function estimateMintAmountWithStableCoin(uint256 amount)
        external
        view
        returns (uint256)
    {
        uint256 amountToMint = _getTokenAmount(amount);
        uint256 mintingFee = token.calculateMintingFee(amountToMint);
        return amountToMint - mintingFee;
    }

    function setSwapToToken(address _token) external onlyRole(MAINTAINER_ROLE) {
        swapToToken = _token;
    }
}
