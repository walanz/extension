import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBalances } from '../api/balance';
import { useBalanceStore } from '../store/balance';
import { BalanceCard } from './BalanceCard';

export const BalanceList: React.FC = () => {
  const { 
    address, 
    selectedChains, 
    shouldFetch, 
    resetFetch,
    setLoading, 
    isLoading,
    triggerFetch
  } = useBalanceStore();
  
  // 查询客户端
  const queryClient = useQueryClient();
  
  // 监听选择的网络变化，如果没有选择任何网络，清除查询缓存
  useEffect(() => {
    if (selectedChains.length === 0) {
      // 清除当前查询的缓存
      queryClient.removeQueries({ queryKey: ['balances', address] });
    }
  }, [selectedChains, address, queryClient]);

  const {
    data,
    isLoading: queryLoading,
    isError,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['balances', address, selectedChains],
    queryFn: async () => {
      console.log('Fetching balances with params:', { address, selectedChains });
      try {
        const result = await fetchBalances(address, selectedChains);
        console.log('Fetch result:', result);
        return result;
      } catch (err) {
        console.error('Fetch error:', err);
        throw err;
      }
    },
    enabled: Boolean(address) && selectedChains.length > 0 && shouldFetch,
    staleTime: 60000, // 1分钟内认为数据是新鲜的
    refetchInterval: 60000, // 1分钟自动刷新一次
  });

  // 同步加载状态到全局
  useEffect(() => {
    setLoading(queryLoading || isFetching);
  }, [queryLoading, isFetching, setLoading]);

  // 查询完成后重置触发状态
  useEffect(() => {
    if (shouldFetch && !queryLoading && !isFetching) {
      resetFetch();
    }
  }, [shouldFetch, queryLoading, isFetching, resetFetch]);
  
  // 监听triggerFetch变化，手动触发refetch
  useEffect(() => {
    if (shouldFetch && address && selectedChains.length > 0) {
      refetch();
    }
  }, [shouldFetch, address, selectedChains, refetch]);

  // 查询结果的调试日志
  useEffect(() => {
    if (data) {
      console.log('Data in component:', data);
      console.log('Data length:', data.length);
      console.log('Total ETH balance:', totalBalance.eth);
    }
  }, [data]);

  // 计算总余额
  const totalBalance = React.useMemo(() => {
    if (!data || data.length === 0) {
      console.log('No data for total balance calculation');
      return { eth: 0, usd: 0 };
    }
    
    try {
      const result = data.reduce(
        (acc, balance) => {
          console.log('Processing balance:', balance);
          const ethBalance = parseFloat(balance.balance || '0');
          const usdBalance = parseFloat(balance.balanceUSD || '0');
          
          console.log(`Adding ${ethBalance} ETH to total`);
          
          return {
            eth: acc.eth + ethBalance,
            usd: acc.usd + usdBalance,
          };
        },
        { eth: 0, usd: 0 }
      );
      
      console.log('Calculated total balance:', result);
      return result;
    } catch (err) {
      console.error('Error calculating total balance:', err);
      return { eth: 0, usd: 0 };
    }
  }, [data]);

  // 未输入地址
  if (!address) {
    return null;
  }
  
  // 未选择网络
  if (selectedChains.length === 0) {
    return (
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">请选择至少一个网络以查询余额</p>
      </div>
    );
  }
  
  // 未触发查询
  if (!shouldFetch && !data) {
    return (
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">点击"查询"按钮获取余额</p>
      </div>
    );
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-2"></div>
          <p className="text-sm text-gray-500">查询余额中...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-6 text-center">
        <p className="text-sm text-red-500">查询出错: {(error as Error).message}</p>
        <button 
          onClick={() => triggerFetch()} 
          className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
        >
          重试
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">没有找到余额数据</p>
        <button 
          onClick={() => triggerFetch()} 
          className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* 总余额显示 */}
      <div className="bg-indigo-50 rounded-lg p-4 mb-4 border border-indigo-100">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">总余额</h2>
          <button 
            onClick={() => triggerFetch()}
            disabled={isFetching}
            className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center"
          >
            {isFetching ? (
              <>
                <span className="inline-block h-3 w-3 mr-1 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></span>
                刷新中
              </>
            ) : (
              '刷新'
            )}
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">{totalBalance.eth.toFixed(6)} ETH</div>
          <div className="text-base font-medium text-gray-700">
            {totalBalance.usd.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
          </div>
        </div>
      </div>

      {/* 余额列表 */}
      <h2 className="text-base font-semibold mb-2">网络余额 ({data.length})</h2>
      <div className="space-y-3">
        {data.map((balance, index) => (
          <BalanceCard key={`${balance.chain}-${index}`} balance={balance} />
        ))}
      </div>
    </div>
  );
}; 