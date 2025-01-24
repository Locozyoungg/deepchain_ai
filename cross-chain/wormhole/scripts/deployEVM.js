// cross-chain/wormhole/scripts/deployEVM.js
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    // Deploy Wormhole Token Bridge
    const TokenBridge = await ethers.getContractFactory("TokenBridge");
    const bridge = await TokenBridge.deploy(
        WORMHOLE_CONFIG.mainnet.coreBridge.ethereum
    );
    
    console.log(`Deployed to ${bridge.address}`);
}

main().catch(console.error);