// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title DeepChain Model Verifier
 * @dev Verifies AI models using validator-signed proofs
 */
contract DeepChainVerifier {
    using ECDSA for bytes32;
    
    // Model hash → verification status
    mapping(bytes32 => bool) public verifiedModels;
    address public immutable validator; // Immutable for security

    event ModelVerified(bytes32 indexed modelHash, address indexed validator);

    constructor(address _validator) {
        require(_validator != address(0), "Invalid validator address");
        validator = _validator;
    }

    /**
     * @dev Verify a model using validator's cryptographic signature
     * @param modelHash Keccak256 hash of model metadata
     * @param signature ECDSA signature from validator
     */
    function verifyModel(
        bytes32 modelHash, 
        bytes calldata signature
    ) external {
        // 1. Reconstruct signed message
        bytes32 ethSignedHash = keccak256(abi.encodePacked(modelHash))
            .toEthSignedMessageHash();
        
        // 2. Validate signature
        require(
            ethSignedHash.recover(signature) == validator,
            "Invalid validator signature"
        );
        
        // 3. Update verification status
        verifiedModels[modelHash] = true;
        emit ModelVerified(modelHash, msg.sender);
    }
}