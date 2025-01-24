// frontend/src/components/DeepChainMarketplace.tsx
import { useAccount, useContractRead } from 'wagmi';
import { useDeepChain } from '../hooks/useDeepChain';
import { shortenAddress } from '../utils/format';

export default function DeepChainMarketplace() {
  const { address } = useAccount();
  const { verifyModel, isVerifying } = useDeepChain();
  
  // Fetch listed models from The Graph
  const { data: models, isLoading } = useContractRead({
    address: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
    abi: MarketplaceABI,
    functionName: 'getAllModels',
  });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">AI Model Marketplace</h1>
      
      {isLoading ? (
        <div className="text-center">Loading models...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models?.map((model) => (
            <div key={model.id} className="border rounded-lg p-4 shadow-lg">
              <h3 className="text-xl font-semibold mb-2">{model.name}</h3>
              <p className="text-gray-600 mb-4">{model.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                  {ethers.utils.formatEther(model.price)} DEEP
                </span>
                <button 
                  onClick={() => verifyModel(model.id)}
                  disabled={isVerifying}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Purchase'}
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Owner: {shortenAddress(model.owner)}</p>
                <p>Verifications: {model.verificationCount}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}