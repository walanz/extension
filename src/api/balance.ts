import axios from 'axios';
import { API_CONFIG } from '../lib/config';

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: 10000,
});

export interface Chain {
  id: number;
  name: string;
  key: string;
}

export interface BalanceResponse {
  address: string;
  chain: string;
  balance: string;
  balanceUSD: string;
  balanceCNY: string;
  timestamp: number;
  explorer?: string;
}

export interface ChainData {
  balanceWei: string;
  balanceEth: string;
  balanceUsd: string;
  balanceCny: string;
  chainId: number;
  explorer: string | null;
  error?: string;
}

export interface AddressResponse {
  address: string;
  chains: Record<string, ChainData>;
  totalBalance: string;
  totalUsd: string;
  totalCny: string;
  ethPrice?: {
    usd: number;
    cny: number;
  };
}

// 获取所有支持的链
export const getChains = async (keyword?: string): Promise<Chain[]> => {
  try {
    const response = await api.get('/chains', { params: { keyword } });
    return response.data.items || [];
  } catch (error) {
    console.error('获取链列表失败:', error);
    throw error;
  }
};

// 查询单个地址在多个链上的余额
export const fetchBalances = async (
  address: string,
  chains?: string[]
): Promise<BalanceResponse[]> => {
  if (!address) throw new Error('地址不能为空');
  
  // 构建请求参数
  const requestData: any = {
    addresses: [address]
  };
  
  // 如果指定了链且长度不为0，才传递chains参数
  if (chains && chains.length > 0) {
    requestData.chains = chains;
  }
  
  try {
    // 使用 POST /v1/addresses/balances 接口
    const response = await api.post('/addresses/balances', requestData);
    
    // 检查响应数据
    console.log('API Response:', response.data);
    
    // 根据接口返回转换格式
    const addressData = response.data.items?.[0];
    
    if (!addressData) {
      console.error('No address data found');
      return [];
    }
    
    if (!addressData.chains || typeof addressData.chains !== 'object') {
      console.error('No chains data or invalid format:', addressData);
      return [];
    }
    
    const timestamp = new Date(response.data.timestamp || Date.now()).getTime();
    const ethPrice = response.data.ethPrice || { usd: 0, cny: 0 };
    
    // 将数据转换为BalanceResponse[]格式
    const balances: BalanceResponse[] = [];
    
    // 遍历所有链数据
    for (const [chainName, chainData] of Object.entries(addressData.chains)) {
      // 安全检查
      if (!chainData || typeof chainData !== 'object') {
        console.warn(`Invalid chain data for ${chainName}:`, chainData);
        continue;
      }
      
      // 确保有余额数据
      if (!('balanceEth' in chainData)) {
        console.warn(`Missing balance data for ${chainName}:`, chainData);
        continue;
      }

      // 将 chainData 转换为 any 类型以便访问属性
      const chainDataObj = chainData as any;

      const balanceItem: BalanceResponse = {
        address,
        chain: chainName,
        balance: String(chainDataObj.balanceEth || '0'),
        balanceUSD: String(chainDataObj.balanceUsd || '0'),
        balanceCNY: String(chainDataObj.balanceCny || '0'),
        timestamp,
        explorer: typeof chainDataObj.explorer === 'string' ? chainDataObj.explorer : undefined
      };
      
      balances.push(balanceItem);
    }
    
    console.log('Parsed balances:', balances);
    return balances;
  } catch (error) {
    console.error('Error fetching balances:', error);
    throw error;
  }
}; 