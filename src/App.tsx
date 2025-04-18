import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AddressInput } from './components/AddressInput';
import { ChainSelector } from './components/ChainSelector';
import { BalanceList } from './components/BalanceList';
import { HistoryList } from './components/HistoryList';
import { BatchAddressInput } from './components/BatchAddressInput';
import { BatchBalanceList } from './components/BatchBalanceList';
import { useBalanceStore } from './store/balance';
import './index.css';

// 创建查询客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000,
    },
  },
});

function App() {
  const { batchMode, toggleBatchMode } = useBalanceStore();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-[400px] min-h-[600px] p-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-indigo-600">Walanz</h1>
          <div className="flex gap-2">
            {/* <button
              onClick={() => setShowHistory(true)}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              历史记录
            </button> */}
            <button
              onClick={toggleBatchMode}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              {batchMode ? '单地址查询' : '批量查询'}
            </button>
          </div>
        </div>
        
        {/* 批量查询模式 */}
        {batchMode ? (
          <>
            <BatchAddressInput />
            <ChainSelector />
            <BatchBalanceList />
          </>
        ) : (
          <>
            <AddressInput />
            <ChainSelector />
            <BalanceList />
          </>
        )}
        
        {/* 历史记录弹窗 */}
        {showHistory && <HistoryList onClose={() => setShowHistory(false)} />}
        
        <footer className="mt-8 pt-4 border-t text-xs text-center text-gray-400">
          <p className='flex justify-center'>© 2025 Walanz <img className='ml-1' src="./public/icons/icon-16.png" alt="icon" /></p>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App; 