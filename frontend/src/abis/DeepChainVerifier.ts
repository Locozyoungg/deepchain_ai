// frontend/src/abis/DeepChainVerifier.ts
export const DeepChainVerifierABI = [
    {
      "inputs": [
        { "internalType": "bytes32", "name": "modelHash", "type": "bytes32" },
        { "internalType": "bytes", "name": "signature", "type": "bytes" }
      ],
      "name": "verifyModel",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "bytes32", "name": "modelHash", "type": "bytes32" },
        { "indexed": true, "internalType": "address", "name": "validator", "type": "address" }
      ],
      "name": "ModelVerified",
      "type": "event"
    },
    {
      "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
      "name": "verifiedModels",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;