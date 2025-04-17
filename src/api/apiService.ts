import axios from "axios";
import { API_CONFIG } from '../lib/config';

// Set the API base URL from config
const API_BASE_URL = API_CONFIG.baseURL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Chain {
  id: number;
  name: string;
  key: string;
}

export interface ChainBalance {
  chain: string;
  chainId: number;
  balanceWei: string;
  balanceEth: string;
  balanceUsd: string;
  balanceCny: string;
  explorer: string | null;
  error?: string;
}

export interface AddressBalance {
  address: string;
  chains: Record<string, ChainBalance>;
  totalBalance: string;
  totalUsd: string;
  totalCny: string;
  ethPrice?: {
    usd: number;
    cny: number;
  };
}

// Fetch all available chains
export async function getChains(keyword?: string): Promise<Chain[]> {
  const params = keyword ? { keyword } : {};
  const response = await apiClient.get("/chains", { params });
  return response.data.items;
}

// Fetch balance for a single address on specified chains
export async function getAddressBalance(address: string, chains?: string[]): Promise<AddressBalance> {
  const response = await apiClient.post("/addresses/balances", {
    addresses: [address],
    chains,
  });
  
  return response.data.items[0];
}

// Fetch balance for a single address on a specific chain
export async function getChainBalance(address: string, chainKey: string): Promise<ChainBalance> {
  const response = await apiClient.get(`/chains/${chainKey}/addresses/${address}/balance`);
  return response.data.item;
} 