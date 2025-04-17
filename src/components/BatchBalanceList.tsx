import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBalanceStore } from '../store/balance';
import { getAddressBalance } from '../api/apiService';

interface ChainTotal {
  chain: string;
  totalEth: number;
  totalUsd: number;
  totalCny: number;
  addresses: number;
}

export const BatchBalanceList: React.FC = () => {
  const { 
    batchAddresses, 
    selectedChains, 
    shouldFetch, 
    resetFetch,
    setLoading,
    triggerFetch
  } = useBalanceStore();
  
  // 批量查询使用Promise.all同时请求多个地址的余额
  const { 
    data, 
    isLoading: queryLoading,
    isError,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['batch-balances', batchAddresses, selectedChains],
    queryFn: async () => {
      console.log('Fetching batch balances:', { addresses: batchAddresses, chains: selectedChains });
      
      // 并行查询所有地址
      const results = await Promise.all(
        batchAddresses.map(address => getAddressBalance(address, selectedChains))
      );
      
      return results;
    },
    enabled: batchAddresses.length > 0 && selectedChains.length > 0 && shouldFetch,
    staleTime: 60000, // 1分钟内认为数据是新鲜的
    refetchInterval: 120000, // 2分钟自动刷新一次
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
    if (shouldFetch && batchAddresses.length > 0 && selectedChains.length > 0) {
      refetch();
    }
  }, [shouldFetch, batchAddresses, selectedChains, refetch]);
  
  // 如果没有地址或没有选择网络，不显示组件
  if (batchAddresses.length === 0 || selectedChains.length === 0) {
    return null;
  }
  
  // 如果没有数据，显示加载状态
  if (!data) {
    if (queryLoading) {
      return (
        <div className="mt-6 text-center">
          <div className="inline-block h-6 w-6 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-2"></div>
          <p>查询中，请稍候...</p>
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="mt-6 text-center text-red-600">
          <p>查询失败: {(error as Error).message}</p>
        </div>
      );
    }
    
    return null;
  }
  
  // 计算每个网络的总余额
  const chainTotals: ChainTotal[] = [];
  let grandTotalEth = 0;
  let grandTotalUsd = 0;
  let grandTotalCny = 0;
  
  // 使用 Map 记录每个链的数据
  const chainMap = new Map<string, ChainTotal>();
  
  // 处理每个地址的余额数据
  data.forEach(addressBalance => {
    // 检查是否有有效的链数据
    if (!addressBalance?.chains) return;
    
    // 遍历每个链上的余额
    Object.entries(addressBalance.chains).forEach(([chainName, chainData]) => {
      const ethBalance = parseFloat(chainData.balanceEth || '0');
      const usdBalance = parseFloat(chainData.balanceUsd || '0');
      const cnyBalance = parseFloat(chainData.balanceCny || '0');
      
      // 累加到总计中
      grandTotalEth += ethBalance;
      grandTotalUsd += usdBalance;
      grandTotalCny += cnyBalance;
      
      // 更新链级汇总数据
      if (chainMap.has(chainName)) {
        const chainTotal = chainMap.get(chainName)!;
        chainTotal.totalEth += ethBalance;
        chainTotal.totalUsd += usdBalance;
        chainTotal.totalCny += cnyBalance;
        chainTotal.addresses += 1;
      } else {
        chainMap.set(chainName, {
          chain: chainName,
          totalEth: ethBalance,
          totalUsd: usdBalance,
          totalCny: cnyBalance,
          addresses: 1
        });
      }
    });
  });
  
  // 将 Map 转换为数组并按ETH余额排序
  chainMap.forEach(chainTotal => chainTotals.push(chainTotal));
  chainTotals.sort((a, b) => b.totalEth - a.totalEth);
  
  // 获取ETH价格
  const ethPrice = data[0]?.ethPrice || { usd: 0, cny: 0 };
  
  return (
    <div className="mt-6">
      {/* 总余额显示 */}
      <div className="bg-indigo-50 rounded-lg p-4 mb-4 border border-indigo-100">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">总余额汇总</h2>
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
        
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">总ETH余额:</div>
            <div className="text-base font-semibold">{grandTotalEth.toFixed(6)} ETH</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">美元价值 (${ethPrice.usd}):</div>
            <div className="text-base font-semibold">${grandTotalUsd.toFixed(2)}</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">人民币价值 (¥{ethPrice.cny}):</div>
            <div className="text-base font-semibold">¥{grandTotalCny.toFixed(2)}</div>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <div>查询时间: {new Date().toLocaleString()}</div>
            <div>查询地址: {batchAddresses.length}个</div>
          </div>
        </div>
      </div>

      {/* 网络余额汇总 */}
      <h2 className="text-base font-semibold mb-2">网络余额汇总</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 border text-left text-xs font-medium text-gray-500">网络</th>
              <th className="px-3 py-2 border text-right text-xs font-medium text-gray-500">地址数</th>
              <th className="px-3 py-2 border text-right text-xs font-medium text-gray-500">ETH余额</th>
              <th className="px-3 py-2 border text-right text-xs font-medium text-gray-500">美元价值</th>
              <th className="px-3 py-2 border text-right text-xs font-medium text-gray-500">人民币价值</th>
            </tr>
          </thead>
          <tbody>
            {chainTotals.map((chainTotal) => (
              <tr key={chainTotal.chain} className="hover:bg-gray-50">
                <td className="px-3 py-2 border">{chainTotal.chain}</td>
                <td className="px-3 py-2 border text-right">{chainTotal.addresses}</td>
                <td className="px-3 py-2 border text-right font-medium">{chainTotal.totalEth.toFixed(6)}</td>
                <td className="px-3 py-2 border text-right">${chainTotal.totalUsd.toFixed(2)}</td>
                <td className="px-3 py-2 border text-right">¥{chainTotal.totalCny.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 