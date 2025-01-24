# model_verifier/verify_proof.sh
#!/bin/bash

# Verify ZK proof for model verification
# Usage: ./verify_proof.sh <proof.json> <public.json> <verification_key.json>

set -e

PROOF_FILE=$1
PUBLIC_FILE=$2
VERIFICATION_KEY=$3

# Verify proof
echo "🔍 Verifying proof..."
snarkjs groth16 verify $VERIFICATION_KEY $PUBLIC_FILE $PROOF_FILE

if [ $? -eq 0 ]; then
    echo "✅ Proof is valid!"
else
    echo "❌ Proof verification failed!"
    exit 1
fi