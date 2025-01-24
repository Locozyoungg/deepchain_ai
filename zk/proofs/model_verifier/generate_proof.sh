# model_verifier/generate_proof.sh
#!/bin/bash

# Generate ZK proof for model verification
# Usage: ./generate_proof.sh <input.json> <output_dir>

set -e

INPUT_FILE=$1
OUTPUT_DIR=$2

# Check dependencies
command -v circom >/dev/null 2>&1 || { echo >&2 "circom not found. Install with 'npm install -g circom'"; exit 1; }
command -v snarkjs >/dev/null 2>&1 || { echo >&2 "snarkjs not found. Install with 'npm install -g snarkjs'"; exit 1; }

# Compile circuit
echo "🔨 Compiling DeepChainModelVerifier circuit..."
circom ../circuits/DeepChainModelVerifier.circom --r1cs --wasm --sym -o $OUTPUT_DIR

# Generate witness
echo "🧠 Generating witness..."
node $OUTPUT_DIR/DeepChainModelVerifier_js/generate_witness.js \
    $OUTPUT_DIR/DeepChainModelVerifier_js/DeepChainModelVerifier.wasm \
    $INPUT_FILE \
    $OUTPUT_DIR/witness.wtns

# Trusted setup
echo "🔑 Performing trusted setup..."
snarkjs groth16 setup $OUTPUT_DIR/DeepChainModelVerifier.r1cs \
    pot12_final.ptau \
    $OUTPUT_DIR/model_verifier_final.zkey

# Generate proof
echo "🔒 Generating proof..."
snarkjs groth16 prove $OUTPUT_DIR/model_verifier_final.zkey \
    $OUTPUT_DIR/witness.wtns \
    $OUTPUT_DIR/proof.json \
    $OUTPUT_DIR/public.json

echo "✅ Proof generated successfully at $OUTPUT_DIR/proof.json"