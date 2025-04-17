export const API_CONFIG = {
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000/v1',
} as const;

// 这些链仅作为默认选择，实际链列表将从API获取
export const DEFAULT_CHAINS = [
  'mainnet',
  'optimism',
  'arbitrum',
  'polygon',
  'base',
] as const; 