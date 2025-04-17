import React, { useState } from 'react';
import { useBalanceStore, AddressHistory } from '../store/balance';

interface HistoryListProps {
  onClose: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ onClose }) => {
  const { addressHistory, removeFromHistory, setAddress, setSelectedNetworks } = useBalanceStore();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // 如果没有历史记录，显示空状态
  if (addressHistory.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-5 max-w-sm w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">历史记录</h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            暂无历史记录
          </div>
        </div>
      </div>
    );
  }

  // 格式化地址显示（前6位后4位，中间用...代替）
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 复制地址到剪贴板
  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 1500);
  };

  // 使用历史记录中的地址和网络
  const useHistoryItem = (item: AddressHistory) => {
    // 设置地址
    setAddress(item.address);
    
    // 设置完整的网络信息
    if (item.networks && item.networks.length > 0) {
      console.log('Using networks from history:', item.networks);
      // 使用历史记录中的完整网络信息
      setSelectedNetworks(item.networks);
    }
    
    // 关闭弹窗
    onClose();
  };

  // 删除历史记录
  const handleRemove = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    removeFromHistory(address);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-5 max-w-sm w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">历史记录</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 pr-1">
          <div className="space-y-2">
            {addressHistory.map((item) => (
              <div 
                key={item.address}
                className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors cursor-pointer flex justify-between items-center"
                onClick={() => useHistoryItem(item)}
              >
                <div className="flex flex-col">
                  <div className="font-medium">{formatAddress(item.address)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                  {/* 显示已保存的网络 */}
                  {item.networks && item.networks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.networks.map(network => (
                        <span 
                          key={network.key}
                          className="inline-block px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px]"
                        >
                          {network.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.address);
                    }}
                  >
                    {copiedAddress === item.address ? '已复制' : '复制'}
                  </button>
                  
                  <button
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded"
                    onClick={(e) => handleRemove(e, item.address)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 