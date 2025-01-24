// frontend/src/utils/zk.ts
import { BigNumberish } from 'ethers';

/**
 * Validate ZK proof inputs
 * @param proof Proof data from circuit
 */
export function validateProofInputs(proof: {
  a: BigNumberish[];
  b: BigNumberish[][];
  c: BigNumberish[];
}): boolean {
  return (
    proof.a.length === 2 &&
    proof.b.length === 2 &&
    proof.b.every(arr => arr.length === 2) &&
    proof.c.length === 2
  );
}

/**
 * Generate proof metadata for display
 * @param proof Raw proof data
 */
export function formatProofMetadata(proof: any): {
  circuit: string;
  timestamp: number;
} {
  return {
    circuit: proof.circuit || 'Unknown Circuit',
    timestamp: proof.timestamp || Math.floor(Date.now() / 1000)
  };
}