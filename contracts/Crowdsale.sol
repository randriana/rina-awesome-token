pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Token.sol";
import "./Swap.sol";

import "hardhat/console.sol";

abstract contract IERC20Extented is IERC20 {
    function decimals() public view virtual returns (uint8);
}

contract Crowdsale is Context, ReentrancyGuard, AccessControl {
    using SafeMath for uint256;
    using SafeERC20 for IERC20Extented;

    Token public token;
    Swap public swap;
    IERC20 public constant DAI =
        IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    address payable public wallet;
    address public treasury;
    address public swapToToken;

    bytes32 public constant MAINTAINER_ROLE = keccak256("MAINTAINER_ROLE");

    mapping(address => bool) acceptedStableCoins;

    uint256 public weiRaised;
    uint256 public rate;

    event TokensMinted(
        address indexed purchaser,
        uint256 value,
        uint256 amount
    );

    event AddAcceptedStableCoin(address indexed coinAddress);
    event RemoveAcceptedStableCoin(address indexed coinAddress);

    constructor(
        address payable _wallet,
        address _treasury,
        address _swapToToken,
        Token _token,
        Swap _swap,
        uint256 _initialRate,
        address[] memory _acceptedStableCoins
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

        _initializeAcceptableStableCoin(_acceptedStableCoins);
    }

    function buyTokensWithETH() external payable nonReentrant {
        address beneficiary = msg.sender;

        _preValidatePurchase(beneficiary, msg.value);

        uint256 swappedAmount = _swapETH(msg.value);

        _forwardAndMint(
            swappedAmount,
            swappedAmount,
            beneficiary,
            IERC20(swapToToken)
        );
    }

    function buyTokensWithStableCoin(
        uint256 amount18based,
        address stableCoinAddress
    ) external nonReentrant {
        require(
            acceptedStableCoins[stableCoinAddress] == true,
            "Token not accepted"
        );

        IERC20Extented coin = IERC20Extented(stableCoinAddress);

        address beneficiary = msg.sender;

        _preValidatePurchase(beneficiary, amount18based);

        uint256 coinAmount = _toCoinAmount(amount18based, coin);

        coin.safeTransferFrom(beneficiary, address(this), coinAmount);

        _forwardAndMint(coinAmount, amount18based, beneficiary, coin);
    }

    function _forwardAndMint(
        uint256 coinAmount,
        uint256 amount18based,
        address beneficiary,
        IERC20 withToken
    ) private {
        _forwardToken(coinAmount, withToken);

        uint256 amountToMint = _getTokenAmount(amount18based);

        _mint(beneficiary, amountToMint);

        weiRaised = weiRaised.add(amount18based);

        emit TokensMinted(_msgSender(), amount18based, amountToMint);

        _updatePurchasingState(beneficiary, amount18based);

        _postValidatePurchase(beneficiary, amount18based);
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

    function addAcceptedStableCoin(address _stableCoin)
        external
        onlyRole(MAINTAINER_ROLE)
    {
        acceptedStableCoins[_stableCoin] = true;
        emit AddAcceptedStableCoin(_stableCoin);
    }

    function removeAcceptedStableCoin(address _stableCoin)
        external
        onlyRole(MAINTAINER_ROLE)
    {
        acceptedStableCoins[_stableCoin] = false;
        emit RemoveAcceptedStableCoin(_stableCoin);
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

    function isAcceptableStableCoin(address coin) external view returns (bool) {
        return acceptedStableCoins[coin];
    }

    function _initializeAcceptableStableCoin(address[] memory addresses)
        private
    {
        for (uint8 i = 0; i < addresses.length; i++) {
            acceptedStableCoins[addresses[i]] = true;
            emit AddAcceptedStableCoin(addresses[i]);
        }
    }

    /**
     * @dev Converts from 18 based decimal system to another coins decimal value.
     * Ex. USDC has decimal = 6, and needs to be treated as such.
     * @param amount original amount in wei
     * @param coin coin with decimal value
     */
    function _toCoinAmount(uint256 amount, IERC20Extented coin)
        private
        view
        returns (uint256)
    {
        return (amount / 1e18) * (10**coin.decimals());
    }
}
