// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DeepChain Bridge
 * @dev Facilitates cross-chain transfer of assets between EVM and Solana networks
 * @notice Handles asset locking/minting with fee management and proof validation
 */
contract DeepChainBridge is Ownable {
    // ===============================================
    // ║          State Variables & Structs            ║
    // ===============================================
    
    /// @dev Mapping of token addresses to their cross-chain representations
    mapping(address => bytes32) public tokenRegistry;

    /// @dev Cross-chain transfer fee (in basis points, 100 = 1%)
    uint256 public crossChainFee = 50; 

    /// @dev Minimum bridgeable amount to prevent dust attacks
    uint256 public constant MIN_BRIDGE_AMOUNT = 0.01 ether;

    /// @dev Authorized oracle address for validating cross-chain proofs
    address public oracle;

    // ===============================================
    // ║                  Events                    ║
    // ===============================================
    
    event TokensDeposited(
        address indexed sender,
        address indexed token,
        uint256 amount,
        bytes32 indexed targetAddress
    );

    event TokensClaimed(
        bytes32 indexed sourceTxHash,
        address indexed token,
        address recipient,
        uint256 amount
    );

    event CrossChainFeeUpdated(uint256 newFee);
    event OracleAddressUpdated(address newOracle);

    // ===============================================
    // ║            Modifiers & Custom Errors           ║
    // ===============================================
    
    error InvalidAddress(string paramName);
    error InvalidAmount();
    error UnregisteredToken();
    error UnauthorizedOracle();

    modifier onlyOracle() {
        if (msg.sender != oracle) revert UnauthorizedOracle();
        _;
    }

    // ===============================================
    // ║             Constructor & Admin              ║
    // ===============================================
    
    constructor(address initialOracle) {
        if (initialOracle == address(0)) revert InvalidAddress("initialOracle");
        oracle = initialOracle;
    }

    /**
     * @dev Update cross-chain transaction fee
     * @param newFee Basis points (1 = 0.01%)
     */
    function setCrossChainFee(uint256 newFee) external onlyOwner {
        require(newFee <= 500, "Fee cannot exceed 5%");
        crossChainFee = newFee;
        emit CrossChainFeeUpdated(newFee);
    }

    /**
     * @dev Register token for cross-chain transfers
     * @param localToken EVM token address
     * @param crossChainId Corresponding token ID on target chain
     */
    function setTokenRegistry(address localToken, bytes32 crossChainId) 
        external 
        onlyOwner 
    {
        if (localToken == address(0)) revert InvalidAddress("localToken");
        tokenRegistry[localToken] = crossChainId;
    }

    // ===============================================
    // ║            Core Bridge Functionality          ║
    // ===============================================
    
    /**
     * @dev Lock tokens on source chain and initiate cross-chain transfer
     * @param token Address of token to bridge (address(0) for native ETH)
     * @param amount Amount to transfer (including fees)
     * @param targetAddress Recipient address on target chain
     */
    function depositTokens(
        address token,
        uint256 amount,
        bytes32 targetAddress
    ) external payable {
        // Validate input parameters
        if (amount < MIN_BRIDGE_AMOUNT) revert InvalidAmount();
        if (tokenRegistry[token] == bytes32(0)) revert UnregisteredToken();

        // Calculate actual transfer amount after fees
        uint256 fee = (amount * crossChainFee) / 10_000;
        uint256 transferAmount = amount - fee;

        if (token == address(0)) {
            // Handle native ETH transfer
            require(msg.value == amount, "ETH amount mismatch");
            (bool sent, ) = address(this).call{value: transferAmount}("");
            require(sent, "ETH transfer failed");
        } else {
            // Handle ERC20 token transfer
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }

        emit TokensDeposited(msg.sender, token, transferAmount, targetAddress);
    }

    /**
     * @dev Release tokens on destination chain (oracle-only)
     * @param proof Cross-chain transfer validation proof
     * @param token Local token address
     * @param recipient Destination address
     * @param amount Transfer amount
     */
    function claimTokens(
        bytes calldata proof,
        address token,
        address recipient,
        uint256 amount
    ) external onlyOracle {
        // Validate proof using oracle signature
        bytes32 proofHash = keccak256(abi.encodePacked(
            block.chainid,
            token,
            recipient,
            amount
        ));
        
        // In production: Implement actual proof validation
        require(proof.length > 0, "Invalid proof");

        if (token == address(0)) {
            (bool sent, ) = recipient.call{value: amount}("");
            require(sent, "ETH transfer failed");
        } else {
            IERC20(token).transfer(recipient, amount);
        }

        emit TokensClaimed(proofHash, token, recipient, amount);
    }

    // ===============================================
    // ║              Helper Functions              ║
    // ===============================================
    
    /// @dev Explicitly prevent accidental ETH sends
    receive() external payable {
        revert("Use depositTokens for ETH bridging");
    }

    /// @dev Get cross-chain ID for a local token
    function getCrossChainId(address token) external view returns (bytes32) {
        return tokenRegistry[token];
    }
}