import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatBalance(balance: string, decimals = 4): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return "0";
  
  if (num < 0.0001) {
    return "< 0.0001";
  }
  
  return num.toFixed(decimals);
}

export function getExplorerUrl(explorerUrl: string, address: string): string {
  if (!explorerUrl || !address) return "";
  return `${explorerUrl}/address/${address}`;
} 