import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAddressBalance } from "../api/apiService";
import { formatBalance } from "../lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BalanceChartProps {
  address: string;
  chains: string[];
}

// Mock data for chart (in a real app, we'd fetch historical data)
const generateMockChartData = (balance: string) => {
  const baseValue = parseFloat(balance);
  if (isNaN(baseValue) || baseValue === 0) return [];

  // Create data points for the last 7 days with small variations
  const now = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    // Add small random variations to the balance
    const variation = Math.random() * 0.05 - 0.025; // -2.5% to +2.5%
    const value = baseValue * (1 + variation);
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: value.toFixed(4),
    });
  }
  
  return data;
};

export default function BalanceChart({ address, chains }: BalanceChartProps) {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d">("7d");
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["balance", address, chains],
    queryFn: () => getAddressBalance(address, chains),
    enabled: !!address && chains.length > 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Balance History</h3>
        <div className="animate-pulse h-36 bg-muted rounded-md" />
      </div>
    );
  }

  if (error || !data) {
    return null; // Don't show chart if there's an error
  }

  const chartData = generateMockChartData(data.totalBalance);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Balance History</h3>
        <div className="flex text-xs space-x-2">
          <button
            onClick={() => setPeriod("24h")}
            className={`px-2 py-1 rounded ${
              period === "24h" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            24h
          </button>
          <button
            onClick={() => setPeriod("7d")}
            className={`px-2 py-1 rounded ${
              period === "7d" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-2 py-1 rounded ${
              period === "30d" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            30d
          </button>
        </div>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatBalance(value.toString(), 2)}
            />
            <Tooltip
              formatter={(value) => [
                `${formatBalance(value.toString(), 4)} ETH`,
                "Balance",
              ]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorBalance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 