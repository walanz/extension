import React, { useState } from 'react';
import { useBalanceStore } from '../store/balance';

export const BatchAddressInput: React.FC = () => {
  const { setBatchAddresses, MAX_BATCH_ADDRESSES, triggerFetch, isLoading } = useBalanceStore();
  const [inputValue, setInputValue] = useState('');
  const [addressCount, setAddressCount] = useState(0);

  // 处理文本输入变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputValue(text);
    
    // 计算有效地址数量
    const addresses = text.split('\n').filter(addr => addr.trim().length > 0);
    setAddressCount(addresses.length);
  };

  // 处理提交
  const handleSubmit = () => {
    // 分割并过滤地址
    const addresses = inputValue
      .split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0);
    
    if (addresses.length === 0) return;
    
    // 设置批量地址并触发查询
    setBatchAddresses(addresses);
    triggerFetch();
  };

  // 清空输入
  const handleClear = () => {
    setInputValue('');
    setAddressCount(0);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-semibold">批量查询地址</h2>
        <div className="text-xs text-gray-500">
          {addressCount > 0 ? 
            `${addressCount}/${MAX_BATCH_ADDRESSES} 个地址` : 
            '每行输入一个地址'
          }
        </div>
      </div>
      
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-32"
        placeholder="每行输入一个地址，最多50个地址"
        value={inputValue}
        onChange={handleTextChange}
      />
      
      <div className="flex justify-between mt-3">
        <button
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
          onClick={handleClear}
        >
          清空
        </button>
        
        <button
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center disabled:bg-indigo-300"
          onClick={handleSubmit}
          disabled={addressCount === 0 || isLoading}
        >
          {isLoading ? (
            <>
              <span className="inline-block h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              查询中...
            </>
          ) : (
            '查询余额'
          )}
        </button>
      </div>
    </div>
  );
}; 