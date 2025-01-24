// frontend/src/utils/format.ts
import { ethers } from 'ethers';

/**
 * Shorten Ethereum address for display
 * @param address Full Ethereum address
 * @returns Formatted address (0x1234...5678)
 */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format Ether values with precision control
 * @param wei Amount in wei
 * @param decimals Number of decimal places (default: 4)
 */
export function formatEther(wei: string, decimals = 4): string {
  return parseFloat(ethers.utils.formatEther(wei)).toFixed(decimals);
}

/**
 * Convert UNIX timestamp to readable date
 * @param timestamp UNIX timestamp (seconds)
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}