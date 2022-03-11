pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Token.sol";
import "./Swap.sol";

import "hardhat/console.sol";

/**
 * @title Crowdsale
 * @dev Crowdsale is a base contract for managing a token crowdsale,
 * allowing investors to purchase amountToMint with ether. This contract implements
 * such functionality in its most fundamental form and can be extended to provide additional
 * functionality and/or custom behavior.
 * The external interface represents the basic interface for purchasing amountToMint, and conforms
 * the base architecture for crowdsales. It is *not* intended to be modified / overridden.
 * The internal interface conforms the extensible and modifiable surface of crowdsales. Override
 * the methods to add functionality. Consider using 'super' where appropriate to concatenate
 * behavior.
 */
contract Crowdsale is Context, ReentrancyGuard, AccessControl{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // The token being sold
    Token private _token;

    // Address where funds are collected
    address payable private _wallet;

    // Amount of wei raised
    uint256 private _weiRaised;
    uint256 private _rate;
    uint256 private _mintingFee;

    bytes32 public constant MAINTAINER_ROLE = keccak256("MAINTAINER_ROLE");

    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public treasury;

    Swap private _swap;


    /**
     * Event for token purchase logging
     * @param purchaser who paid for the amountToMint     
     * @param value weis paid for purchase
     * @param amount amount of amountToMint purchased
     */
    event TokensMinted(address indexed purchaser, uint256 value, uint256 amount);

    /**     
     * @dev The rate is the conversion between wei and the smallest and indivisible
     * token unit. So, if you are using a rate of 1 with a ERC20Detailed token
     * with 3 decimals called TOK, 1 wei will give you 1 unit, or 0.001 TOK.
     * @param wallet Address where collected funds will be forwarded to
     * @param token Address of the token being sold
     * @param initialRate Initial rate for token price
     */
    constructor (address payable wallet, Token token, uint256 initialRate, Swap swap, uint256 mintingFee, address _treasury){        
        require(wallet != address(0), "Crowdsale: wallet is the zero address");
        require(address(token) != address(0), "Crowdsale: token is the zero address");        
        require(initialRate > 0, "Rate cannot be 0");
        require(treasury != address(0), "Treasury is zero address");
        
        _wallet = wallet;
        _token = token;        
        _rate = initialRate;
        _swap = swap;
        _mintingFee = mintingFee;
        treasury = _treasury;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @param beneficiary Recipient of the token purchase
     */
    function buyTokens(address beneficiary) external nonReentrant payable {        
        _preValidatePurchase(beneficiary, msg.value);

        uint256 swappedAmount = _swapETH(msg.value);

        _forwardFunds(swappedAmount);
        
        uint256 amountToMint = _getTokenAmount(swappedAmount);
        uint256 mintingFee = _calculateFee(amountToMint);
        
        amountToMint -= mintingFee;

        // update state
        _weiRaised = _weiRaised.add(swappedAmount);

        _mint(treasury, mintingFee);
        _mint(beneficiary, amountToMint);

        emit TokensMinted(_msgSender(), swappedAmount, amountToMint);

        _updatePurchasingState(beneficiary, swappedAmount);

        _postValidatePurchase(beneficiary, swappedAmount);
    }


    /**
     * Note that other contracts will transfer funds with a base gas stipend
     * of 2300, which is not enough to call buyTokens. Consider calling
     * buyTokens directly when purchasing amountToMint from a contract.
     */
    receive () external payable {}

    /**
     * @return the token being sold.
     */
    function token() public view returns (IERC20) {
        return _token;
    }

    /**
     * @return the address where funds are collected.
     */
    function wallet() public view returns (address payable) {
        return _wallet;
    }

    /**
     * @return the number of token units a buyer gets per wei.
     */
    function getRate() public view returns (uint256) {                
        return _rate;
    }

    function setRate(uint256 newRate) external onlyRole(MAINTAINER_ROLE) {
        _rate = newRate;
    }

    /**
     * @return the amount of wei raised.
     */
    function weiRaised() public view returns (uint256) {
        return _weiRaised;
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
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view virtual {
        require(beneficiary != address(0), "Crowdsale: beneficiary is the zero address");
        require(weiAmount != 0, "Crowdsale: weiAmount is 0");
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
    }

    /**
     * @dev Validation of an executed purchase. Observe state and use revert statements to undo rollback when valid
     * conditions are not met.
     * @param beneficiary Address performing the token purchase
     * @param weiAmount Value in wei involved in the purchase
     */
    function _postValidatePurchase(address beneficiary, uint256 weiAmount) internal view virtual {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Override for extensions that require an internal state to check for validity (current user contributions,
     * etc.)
     * @param beneficiary Address receiving the amountToMint
     * @param weiAmount Value in wei involved in the purchase
     */
    function _updatePurchasingState(address beneficiary, uint256 weiAmount) internal virtual {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Override to extend the way in which ether is converted to amountToMint.
     * @param weiAmount Value in wei to be converted into amountToMint
     * @return Number of amountToMint that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 weiAmount) private view returns (uint256) {
        return weiAmount.mul(_rate) / 1 ether;
    }

    /**
     * @dev Determines how ETH is stored/forwarded on purchases.
     */
    function _forwardFunds(uint256 amount) private {
        IERC20(DAI).transfer(address(_wallet), amount);        
    }

    function _mint(address to, uint256 tokenAmount) private {
        _token.mint(to, tokenAmount);
    }

    function _swapETH(uint256 amount) private returns (uint256) {
        return _swap.swapETH{ value: amount}();
    }

    function _calculateFee(uint256 amount) private view returns (uint256) {
        return amount * _mintingFee;
    }
}