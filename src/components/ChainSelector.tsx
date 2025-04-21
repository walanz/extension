import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBalanceStore, NetworkInfo } from '../store/balance';
import { getChains, Chain } from '../api/balance';

export const ChainSelector: React.FC = () => {
  const { 
    selectedChains,
    selectedNetworks,
    toggleChain,
    toggleNetwork,
    setSelectedNetworks,
    clearSelectedChains, 
    MAX_SELECTED_CHAINS, 
    resetFetch 
  } = useBalanceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 获取所有链
  const { data: chains = [], isLoading: isChainsLoading } = useQuery<Chain[]>({
    queryKey: ['chains', searchTerm],
    queryFn: () => getChains(searchTerm),
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });

  // 当加载API返回的链数据后，更新selectedNetworks以确保信息完整
  useEffect(() => {
    if (chains.length > 0 && selectedChains.length > 0) {
      console.log('Running useEffect to sync networks');
      console.log('Available chains:', chains);
      console.log('Selected chains:', selectedChains);
      console.log('Current selectedNetworks:', selectedNetworks);
      
      // 创建一个映射，key是链键，value是完整网络信息
      const networkMap = new Map<string, NetworkInfo>();
      
      // 先从已存储的selectedNetworks中获取信息
      selectedNetworks.forEach(network => {
        networkMap.set(network.key, network);
      });
      
      // 从API获取的chains中补充缺失的信息
      chains.forEach(chain => {
        if (selectedChains.includes(chain.key) && !networkMap.has(chain.key)) {
          const newNetwork = {
            id: chain.id,
            name: chain.name,
            key: chain.key
          };
          networkMap.set(chain.key, newNetwork);
          console.log('Adding network from API:', newNetwork);
        }
      });
      
      // 确保selectedChains和networkMap中的键一致
      const updatedNetworks: NetworkInfo[] = [];
      
      selectedChains.forEach(chainKey => {
        const network = networkMap.get(chainKey);
        if (network) {
          updatedNetworks.push(network);
        } else {
          // 如果找不到网络信息，创建一个基本的网络信息对象
          console.log('Creating fallback network for:', chainKey);
          updatedNetworks.push({
            id: 0, // 使用默认ID
            name: chainKey.charAt(0).toUpperCase() + chainKey.slice(1), // 首字母大写作为显示名
            key: chainKey
          });
        }
      });
      
      console.log('Final updated networks:', updatedNetworks);
      
      if (JSON.stringify(updatedNetworks) !== JSON.stringify(selectedNetworks)) {
        console.log('Networks changed, updating state');
        setSelectedNetworks(updatedNetworks);
      } else {
        console.log('No changes to networks');
      }
    }
  }, [chains, selectedChains]);

  // 当前已选择的数量
  const selectedCount = selectedNetworks.length || selectedChains.length;
  const canSelectMore = selectedCount < MAX_SELECTED_CHAINS;

  // 使用selectedNetworks来显示已选择的网络
  const selectedChainsDetails = selectedNetworks.length > 0 
    ? selectedNetworks.map(network => ({
        key: network.key,
        name: network.name,
        icon: '🌐'
      }))
    : selectedChains.map(chainKey => {
        // 兼容旧数据，如果只有key没有完整信息
        const chainInfo = chains.find(chain => chain.key === chainKey);
        return chainInfo 
          ? { key: chainInfo.key, name: chainInfo.name, icon: '🌐' }
          : { key: chainKey, name: chainKey.charAt(0).toUpperCase() + chainKey.slice(1), icon: '🌐' };
      });
  
  // 记录选择的网络，便于调试
  console.log('Selected chains in state:', selectedChains);
  console.log('Selected networks in state:', selectedNetworks);
  console.log('Selected chains details for display:', selectedChainsDetails);
  
  // 处理清空选择
  const handleClearSelection = () => {
    clearSelectedChains();
    resetFetch(); // 重置查询状态，清除余额数据显示
  };

  // 处理网络切换
  const handleToggleNetwork = (chain: Chain) => {
    console.log('Toggling network:', chain);
    
    // 创建完整网络信息对象
    const network: NetworkInfo = {
      id: chain.id,
      name: chain.name,
      key: chain.key
    };
    
    // 只调用toggleNetwork方法
    toggleNetwork(network);
  };

  // 处理已选择网络中的移除
  const handleRemoveNetwork = (chainKey: string) => {
    console.log('Removing network:', chainKey);
    
    // 找到完整的网络信息
    const network = selectedNetworks.find(n => n.key === chainKey);
    
    if (network) {
      // 如果找到完整信息，使用toggleNetwork
      toggleNetwork(network);
    } else {
      // 如果没有找到完整信息，使用toggleChain作为备用
      toggleChain(chainKey);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">选择网络</h2>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500">
            {selectedCount}/{MAX_SELECTED_CHAINS}
          </div>
          <button
            style={{
              display: 'none'
            }}
            onClick={() => {
              console.log('Debug state:', {
                selectedChains,
                selectedNetworks,
                chains,
                selectedChainsDetails
              });
            }}
            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 mr-1"
          >
            调试
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
          >
            选择网络
          </button>
        </div>
      </div>

      {/* 已选择的网络 */}
      {selectedCount > 0 ? (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">已选择的网络</div>
          <div className="flex flex-wrap gap-1">
            {selectedChainsDetails.map(chain => (
              <div 
                key={chain.key}
                className="flex items-center px-2 py-1 text-xs bg-white rounded border border-gray-200"
              >
                <span className="mr-1">{chain.icon}</span>
                <span>{chain.name}</span>
                <button 
                  onClick={() => handleRemoveNetwork(chain.key)}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-3 p-2 text-xs bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
          请选择至少一个网络以查询余额（最多{MAX_SELECTED_CHAINS}个）
        </div>
      )}

      {/* 网络选择模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">选择网络</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-3 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索网络..."
                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {/* 搜索时的加载指示器 */}
              {isChainsLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-gray-500">
                已选择 {selectedCount}/{MAX_SELECTED_CHAINS}
              </div>
              <button
                onClick={handleClearSelection}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                disabled={selectedCount === 0}
              >
                清空
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-1">
              {isChainsLoading && searchTerm && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-gray-600">正在搜索网络...</span>
                  </div>
                </div>
              )}

              {!isChainsLoading && searchTerm && chains.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center">
                    <svg className="h-8 w-8 text-gray-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">未找到匹配的网络</span>
                  </div>
                </div>
              )}

              {!isChainsLoading && !searchTerm && chains.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center">
                    <svg className="h-8 w-8 text-gray-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm text-gray-600">无可用网络</span>
                  </div>
                </div>
              )}

              {!isChainsLoading && (
                <>
                  {/* 主网 */}
                  {chains.filter(chain => chain.key === 'mainnet').length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">主网</div>
                      <div className="space-y-1">
                        {chains.filter(chain => chain.key === 'mainnet').map((chain) => (
                          <ChainButton 
                            key={chain.key}
                            chain={chain}
                            selected={selectedChains.includes(chain.key)}
                            onToggle={() => handleToggleNetwork(chain)}
                            disabled={!canSelectMore && !selectedChains.includes(chain.key)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 二层网络 */}
                  {chains.filter(chain => ['optimism', 'arbitrum', 'polygon', 'base'].includes(chain.key)).length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">二层网络</div>
                      <div className="space-y-1">
                        {chains.filter(chain => ['optimism', 'arbitrum', 'polygon', 'base'].includes(chain.key)).map((chain) => (
                          <ChainButton 
                            key={chain.key}
                            chain={chain}
                            selected={selectedChains.includes(chain.key)}
                            onToggle={() => handleToggleNetwork(chain)}
                            disabled={!canSelectMore && !selectedChains.includes(chain.key)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 其他网络 */}
                  {chains.filter(chain => 
                    chain.key !== 'mainnet' && 
                    !['optimism', 'arbitrum', 'polygon', 'base'].includes(chain.key)
                  ).length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">其他网络</div>
                      <div className="space-y-1">
                        {chains.filter(chain => 
                          chain.key !== 'mainnet' && 
                          !['optimism', 'arbitrum', 'polygon', 'base'].includes(chain.key)
                        ).map((chain) => (
                          <ChainButton 
                            key={chain.key}
                            chain={chain}
                            selected={selectedChains.includes(chain.key)}
                            onToggle={() => handleToggleNetwork(chain)}
                            disabled={!canSelectMore && !selectedChains.includes(chain.key)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ChainButtonProps {
  chain: Chain;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ChainButton: React.FC<ChainButtonProps> = ({ chain, selected, onToggle, disabled = false }) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`flex items-center w-full p-2 rounded-lg border ${
        selected
          ? 'bg-indigo-50 border-indigo-300'
          : 'bg-white border-gray-200'
      } ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
      }`}
    >
      <span className="mr-2 text-lg">🌐</span>
      <span className="flex-1 text-left truncate text-sm">{chain.name}</span>
      {selected && <span className="text-indigo-600">✓</span>}
    </button>
  );
}; 