pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title DeepChain Reputation System
 * @dev Manages staking and reputation scores for participants
 */
contract DeepChainReputation {
    using Math for uint256;
    
    IERC20 public immutable deepToken;
    mapping(address => uint256) public reputationScore;
    
    event ReputationUpdated(address indexed user, int256 change);

    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "Invalid token address");
        deepToken = IERC20(_tokenAddress);
    }

    /**
     * @dev Stake tokens to earn reputation points
     * @param amount Amount of DEEP tokens to stake
     */
    function stakeForReputation(uint256 amount) external {
        // Transfer tokens to contract
        bool success = deepToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");
        
        // Calculate reputation using square root to prevent gaming
        uint256 reputationGain = amount.sqrt();
        
        // Update reputation
        reputationScore[msg.sender] += reputationGain;
        emit ReputationUpdated(msg.sender, int256(reputationGain));
    }
}