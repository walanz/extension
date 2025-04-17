import React, { useState, useEffect } from 'react';
import { useBalanceStore } from '../store/balance';
import { isValidWalletInput } from '../utils/validation';

export const AddressInput: React.FC = () => {
  const { 
    inputAddress, 
    setInputAddress, 
    setAddress, 
    selectedChains, 
    triggerFetch,
    isLoading
  } = useBalanceStore();
  
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 当输入地址变化时验证格式
  useEffect(() => {
    if (!inputAddress.trim()) {
      setIsValid(false);
      setError(null);
      return;
    }
    
    if (isValidWalletInput(inputAddress.trim())) {
      setIsValid(true);
      setError(null);
    } else {
      setIsValid(false);
      setError('请输入有效的ETH地址或ENS域名');
    }
  }, [inputAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) return;
    
    if (selectedChains.length === 0) {
      setError('请至少选择一个网络');
      return;
    }
    
    // 设置当前查询地址并触发查询
    setAddress(inputAddress.trim());
    triggerFetch();
    setError(null);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex overflow-hidden rounded-lg ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-500">
          <input
            type="text"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            placeholder="输入ETH地址或ENS域名"
            className={`flex-1 px-4 py-2 border-0 focus:outline-none ${
              error ? 'bg-red-50' : 'bg-white'
            }`}
          />
          <button
            type="submit"
            disabled={!isValid || isLoading || selectedChains.length === 0}
            className={`px-4 py-2 text-white focus:outline-none ${
              !isValid || isLoading || selectedChains.length === 0
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? '查询中...' : '查询'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mt-1 text-xs text-red-500">{error}</div>
      )}
    </div>
  );
}; 