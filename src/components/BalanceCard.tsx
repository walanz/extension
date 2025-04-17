import React from 'react';
import { BalanceResponse } from '../api/balance';

interface BalanceCardProps {
  balance: BalanceResponse;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  // 确保余额是有效数值
  const balanceValue = parseFloat(balance.balance || '0');
  
  // Format ETH balance to max 6 decimal places
  const formattedEthBalance = balanceValue.toFixed(6);
  
  // 格式化美元余额
  const formattedUsdBalance = parseFloat(balance.balanceUSD || '0').toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  // 格式化人民币余额
  const formattedCnyBalance = parseFloat(balance.balanceCNY || '0').toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  });

  // 获取网络图标
  const chainIcon = '🌐';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{chainIcon}</span>
          <div>
            <h3 className="font-medium">{balance.chain}</h3>
            <div className="text-sm text-gray-500">
              {new Date(balance.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">{formattedEthBalance} ETH</div>
          <div className="text-xs text-gray-600">{formattedUsdBalance} / {formattedCnyBalance}</div>
          {balance.explorer && (
            <a
              href={balance.explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-500 hover:text-indigo-700"
            >
              浏览器查看
            </a>
          )}
        </div>
      </div>
    </div>
  );
}; 