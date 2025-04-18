import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 保存网络的完整信息而不仅仅是key
export interface NetworkInfo {
  id: number;
  name: string;
  key: string;
}

export interface AddressHistory {
  address: string;
  timestamp: number;
  networks: NetworkInfo[]; // 改为存储完整的网络信息
}

interface BalanceState {
  address: string;
  inputAddress: string; // 输入框中的值
  selectedChains: string[]; // 仍然使用key存储已选择的网络（为了兼容性）
  selectedNetworks: NetworkInfo[]; // 存储完整的网络信息
  isAddressValid: boolean; // 地址格式是否有效
  isLoading: boolean; // 是否正在加载
  shouldFetch: boolean; // 是否应该获取数据
  batchMode: boolean; // 是否为批量查询模式
  batchAddresses: string[]; // 批量查询的地址列表
  addressHistory: AddressHistory[]; // 查询历史记录
  
  setInputAddress: (address: string) => void;
  setAddress: (address: string) => void;
  setSelectedChains: (chains: string[]) => void;
  setSelectedNetworks: (networks: NetworkInfo[]) => void; // 设置完整网络信息
  toggleNetwork: (network: NetworkInfo) => void; // 切换网络，使用完整信息
  toggleChain: (chain: string) => void; // 保留兼容性
  clearSelectedChains: () => void;
  triggerFetch: () => void; // 触发查询
  setLoading: (loading: boolean) => void; // 设置加载状态
  resetFetch: () => void; // 重置查询状态
  toggleBatchMode: () => void; // 切换批量模式
  setBatchAddresses: (addresses: string[]) => void; // 设置批量地址
  addToHistory: (address: string) => void; // 添加到历史记录
  clearHistory: () => void; // 清空历史记录
  removeFromHistory: (address: string) => void; // 从历史记录中删除
  
  // 最多选择的网络数
  MAX_SELECTED_CHAINS: number;
  // 批量查询最大地址数
  MAX_BATCH_ADDRESSES: number;
  // 最大历史记录数
  MAX_HISTORY_ITEMS: number;
}

export const useBalanceStore = create<BalanceState>()(
  persist(
    (set, get) => ({
      address: '',
      inputAddress: '',
      selectedChains: [],
      selectedNetworks: [],
      isAddressValid: false,
      isLoading: false,
      shouldFetch: false,
      batchMode: false,
      batchAddresses: [],
      addressHistory: [],
      MAX_SELECTED_CHAINS: 5,
      MAX_BATCH_ADDRESSES: 50,
      MAX_HISTORY_ITEMS: 20,
      
      setInputAddress: (input) => set({ inputAddress: input }),
      
      setAddress: (address) => {
        set({ 
          address,
          isAddressValid: address.length > 0 
        });
        // 如果是有效地址，添加到历史记录
        if (address.length > 0) {
          get().addToHistory(address);
        }
      },
      
      setSelectedChains: (chains) => set({ 
        // 确保不超过最大选择数量
        selectedChains: chains.slice(0, get().MAX_SELECTED_CHAINS),
        // 清空选择时重置查询状态
        shouldFetch: chains.length > 0
      }),
      
      setSelectedNetworks: (networks) => {
        // 提取网络的key列表
        const chains = networks.map(network => network.key);
        set({ 
          selectedNetworks: networks,
          // 同时更新selectedChains以保持兼容性
          selectedChains: chains,
          // 更新查询状态
          shouldFetch: networks.length > 0
        });
      },
      
      toggleNetwork: (network) =>
        set((state) => {
          console.log('toggleNetwork called with:', network);
          
          // 检查是否已经有这个网络（通过key匹配）
          const existingIndex = state.selectedNetworks.findIndex(n => n.key === network.key);
          const exists = existingIndex >= 0;
          
          // 处理移除
          if (exists) {
            console.log('Removing network:', network.key);
            // 移除网络
            const newSelectedNetworks = [...state.selectedNetworks];
            newSelectedNetworks.splice(existingIndex, 1);
            
            // 同步更新selectedChains
            const newSelectedChains = state.selectedChains.filter(c => c !== network.key);
            
            // 如果清空了所有选择，重置查询状态
            if (newSelectedNetworks.length === 0) {
              return {
                selectedNetworks: [],
                selectedChains: [],
                shouldFetch: false
              };
            }
            
            return {
              selectedNetworks: newSelectedNetworks,
              selectedChains: newSelectedChains
            };
          }
          
          // 处理添加
          if (state.selectedNetworks.length < state.MAX_SELECTED_CHAINS) {
            console.log('Adding network:', network.key);
            // 添加网络
            const newSelectedNetworks = [...state.selectedNetworks, network];
            // 同步更新selectedChains
            const newSelectedChains = [...state.selectedChains, network.key];
            
            return {
              selectedNetworks: newSelectedNetworks,
              selectedChains: newSelectedChains,
              shouldFetch: true
            };
          }
          
          // 已达到最大数量，不进行任何更改
          console.log('Max chains reached - no changes');
          return state;
        }),
      
      toggleChain: (chain) =>
        set((state) => {
          console.log('Warning: toggleChain is deprecated, use toggleNetwork instead');
          console.log('toggleChain called with:', chain);
          
          // 检查是否已包含该链
          const exists = state.selectedChains.includes(chain);
          
          if (exists) {
            // 移除链
            const newSelectedChains = state.selectedChains.filter(c => c !== chain);
            // 同步移除网络
            const newSelectedNetworks = state.selectedNetworks.filter(n => n.key !== chain);
            
            // 如果清空了所有选择，重置查询状态
            if (newSelectedChains.length === 0) {
              return {
                selectedChains: [],
                selectedNetworks: [],
                shouldFetch: false
              };
            }
            
            return {
              selectedChains: newSelectedChains,
              selectedNetworks: newSelectedNetworks
            };
          }
          
          // 添加链
          if (state.selectedChains.length < state.MAX_SELECTED_CHAINS) {
            const newSelectedChains = [...state.selectedChains, chain];
            
            // 尝试构建一个基本的网络信息（后续useEffect会更新）
            const newSelectedNetworks = [...state.selectedNetworks];
            newSelectedNetworks.push({
              id: 0,
              name: chain.charAt(0).toUpperCase() + chain.slice(1),
              key: chain
            });
            
            return {
              selectedChains: newSelectedChains,
              selectedNetworks: newSelectedNetworks,
              shouldFetch: true
            };
          }
          
          // 已达到最大数量，不进行更改
          return state;
        }),
      
      clearSelectedChains: () => set({ 
        selectedChains: [],
        selectedNetworks: [],
        shouldFetch: false // 清空选择时重置查询状态
      }),
      
      triggerFetch: () => set({ shouldFetch: true }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      resetFetch: () => set({ shouldFetch: false }),
      
      toggleBatchMode: () => set(state => ({ 
        batchMode: !state.batchMode,
        batchAddresses: []
      })),
      
      setBatchAddresses: (addresses) => {
        // 过滤掉空地址并限制数量
        const validAddresses = addresses
          .filter(addr => addr.trim().length > 0)
          .slice(0, get().MAX_BATCH_ADDRESSES);
        
        set({ 
          batchAddresses: validAddresses,
          // 如果有有效地址，则添加到历史记录
          shouldFetch: validAddresses.length > 0
        });
        
        // 将所有地址添加到历史记录
        validAddresses.forEach(addr => {
          get().addToHistory(addr);
        });
      },
      
      addToHistory: (address) => set(state => {
        // 检查地址是否已存在
        const existingIndex = state.addressHistory.findIndex(
          item => item.address === address
        );
        
        let newHistory;
        
        if (existingIndex >= 0) {
          // 如果存在，更新时间戳和使用的网络
          newHistory = [...state.addressHistory];
          newHistory[existingIndex] = {
            ...newHistory[existingIndex],
            timestamp: Date.now(),
            // 直接使用当前选择的网络，不附加到之前的记录上
            // 确保去重并深复制
            networks: state.selectedNetworks.map(network => ({ ...network }))
          };
        } else {
          // 如果不存在，添加新记录
          newHistory = [
            {
              address,
              timestamp: Date.now(),
              // 深复制网络信息
              networks: state.selectedNetworks.map(network => ({ ...network }))
            },
            ...state.addressHistory
          ].slice(0, state.MAX_HISTORY_ITEMS); // 限制历史记录数量
        }
        
        return { addressHistory: newHistory };
      }),
      
      clearHistory: () => set({ addressHistory: [] }),
      
      removeFromHistory: (address) => set(state => ({
        addressHistory: state.addressHistory.filter(item => item.address !== address)
      }))
    }),
    {
      name: 'balance-storage', // 存储的名称
      partialize: (state) => ({
        // 只持久化这些字段
        selectedChains: state.selectedChains,
        selectedNetworks: state.selectedNetworks,
        addressHistory: state.addressHistory
      })
    }
  )
); 