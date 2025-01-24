// gdpr_compliance/witness_generator.js
const fs = require('fs');
const path = require('path');
const { compute } = require('circom_runtime');
const { bigInt } = require('snarkjs');

// Load circuit artifacts
const circuit = require('./DeepChainCompliance_js/witness_calculator');

async function generateWitness(inputFile, outputFile) {
    // 1. Load input data
    const inputData = JSON.parse(fs.readFileSync(inputFile));
    
    // 2. Initialize witness calculator
    const wasmBuffer = fs.readFileSync(
        path.join(__dirname, 'DeepChainCompliance_js/DeepChainCompliance.wasm')
    );
    const wc = await circuit(wasmBuffer);
    
    // 3. Calculate witness
    const witnessBuffer = await wc.calculateWTNSBin(
        {
            rawDataHash: bigInt(inputData.rawDataHash),
            processedDataHash: bigInt(inputData.processedDataHash),
            salt: bigInt(inputData.salt)
        },
        0
    );

    // 4. Save witness
    fs.writeFileSync(outputFile, witnessBuffer);
    console.log(`Witness generated at ${outputFile}`);
}

// Run with test inputs
generateWitness(
    './test_inputs.json',
    './witness.wtns'
).catch(console.error);