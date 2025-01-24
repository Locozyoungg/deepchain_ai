// frontend/src/hooks/useDeepChain.ts
import { useCallback, useState } from 'react';
import { useContract, useSigner } from 'wagmi';
import { DeepChainVerifierABI } from '../abis/DeepChainVerifier';

export function useDeepChain() {
  const { data: signer } = useSigner();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifierContract = useContract({
    address: process.env.NEXT_PUBLIC_VERIFIER_ADDRESS,
    abi: DeepChainVerifierABI,
    signerOrProvider: signer,
  });

  const verifyModel = useCallback(async (modelId: string) => {
    try {
      setIsVerifying(true);
      setError(null);
      
      const tx = await verifierContract.verifyModel(modelId);
      await tx.wait();
      
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      return { success: false };
    } finally {
      setIsVerifying(false);
    }
  }, [verifierContract]);

  const checkVerificationStatus = useCallback(async (modelId: string) => {
    return verifierContract.isVerified(modelId);
  }, [verifierContract]);

  return {
    verifyModel,
    checkVerificationStatus,
    isVerifying,
    error
  };
}