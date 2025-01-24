// frontend/src/components/DeepChainReputation.tsx
import { useAccount, useContractRead } from 'wagmi';

export default function DeepChainReputation() {
  const { address } = useAccount();
  
  const { data: reputation, isLoading } = useContractRead({
    address: process.env.NEXT_PUBLIC_REPUTATION_ADDRESS,
    abi: ReputationABI,
    functionName: 'getReputation',
    args: [address],
    watch: true
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Reputation Dashboard</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Your Reputation Score</h3>
            {isLoading ? (
              <span className="text-gray-500">Loading...</span>
            ) : (
              <span className="text-3xl font-bold text-blue-600">
                {reputation?.toString() || 0}
              </span>
            )}
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Stake Tokens
          </button>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Recent Activity</h4>
          {/* Activity history would go here */}
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    </div>
  );
}