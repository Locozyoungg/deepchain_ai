// frontend/src/utils/errors.ts
interface RpcError {
    code: number;
    message: string;
    data?: {
      code: number;
      message: string;
    };
  }
  
  /**
   * Parse blockchain operation errors
   * @param error Error object from contract interaction
   * @returns Human-readable error message
   */
  export function parseError(error: unknown): string {
    const defaultMessage = 'Transaction failed';
    
    if (error instanceof Error) {
      const rpcError = error as unknown as RpcError;
      return rpcError.data?.message || rpcError.message || defaultMessage;
    }
    
    return defaultMessage;
  }