# cross-chain/layerzero/deploy.sh
#!/bin/bash

# Deploy LayerZero contracts across chains
NETWORK=$1

echo "🚀 Deploying to $NETWORK..."

case $NETWORK in
  ethereum)
    forge create LayerZeroEndpoint \
      --rpc-url $ETH_RPC_URL \
      --private-key $DEPLOYER_PK
    ;;
  polygon)
    forge create LayerZeroEndpoint \
      --rpc-url $POLYGON_RPC_URL \
      --private-key $DEPLOYER_PK
    ;;
  solana)
    anchor deploy \
      --provider.cluster $SOLANA_CLUSTER \
      --program-id LZ1oo6RGuJBQxJ6cdo2CRZ2NPG9bT1dr4q1JAowC8d
    ;;
  *)
    echo "Unknown network"
    exit 1
    ;;
esac

echo "✅ Deployment complete"