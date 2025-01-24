// cross-chain/layerzero/LayerZeroConfig.sol
pragma solidity ^0.8.20;

library LayerZeroConfig {
    struct ChainConfig {
        uint16 chainId;
        address endpoint;
        address zroPaymentAddress;
    }
    
    // Mainnet configurations
    mapping(string => ChainConfig) public mainnetConfigs;
    
    constructor() {
        mainnetConfigs["ethereum"] = ChainConfig({
            chainId: 101,
            endpoint: 0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675,
            zroPaymentAddress: 0x787A1acB779a0DD33A944Fbb45e549b0457f6B21
        });
        
        mainnetConfigs["polygon"] = ChainConfig({
            chainId: 109,
            endpoint: 0x3c2269811836af69497E5F486A85D7316753cf62,
            zroPaymentAddress: 0x787A1acB779a0DD33A944Fbb45e549b0457f6B21
        });

        mainnetConfigs["solana"] = ChainConfig({
            chainId: 124,
            endpoint: 0x4D73AdB72bC3DD368966edD0f0b2148401A178E2,
            zroPaymentAddress: 0x787A1acB779a0DD33A944Fbb45e549b0457f6B21
        });
    }

    function getConfig(string memory chainName) public view returns (ChainConfig memory) {
        return mainnetConfigs[chainName];
    }
}