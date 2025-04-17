import { useQuery } from "@tanstack/react-query";
import { getAddressBalance } from "../api/apiService";
import { formatBalance, shortenAddress } from "../lib/utils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface BalanceCardsProps {
  address: string;
  chains: string[];
}

export default function BalanceCards({ address, chains }: BalanceCardsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["balance", address, chains],
    queryFn: () => getAddressBalance(address, chains),
    enabled: !!address && chains.length > 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Balances</h3>
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-muted rounded-md mb-2"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-md p-4 border border-destructive/30 bg-destructive/10 text-destructive">
        <h3 className="font-medium">Error loading balances</h3>
        <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  // Group chains into mainnet and L2
  const mainnetChains = Object.values(data.chains).filter(
    chain => chain.chain === "Ethereum" || chain.chain === "Mainnet"
  );

  const layer2Chains = Object.values(data.chains).filter(
    chain => chain.chain !== "Ethereum" && chain.chain !== "Mainnet"
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Balances</h3>
        <div className="text-right">
          <div className="text-sm font-medium">{formatBalance(data.totalBalance, 4)} ETH</div>
          <div className="text-xs text-muted-foreground">{shortenAddress(address)}</div>
        </div>
      </div>

      {mainnetChains.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-1">Mainnet</div>
          {mainnetChains.map((chain) => (
            <BalanceCard key={chain.chain} chain={chain} address={address} />
          ))}
        </div>
      )}

      {layer2Chains.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-1">Layer 2</div>
          {layer2Chains.map((chain) => (
            <BalanceCard key={chain.chain} chain={chain} address={address} />
          ))}
        </div>
      )}
    </div>
  );
}

interface BalanceCardProps {
  chain: {
    chain: string;
    balanceEth: string;
    explorer: string | null;
  };
  address: string;
}

function BalanceCard({ chain, address }: BalanceCardProps) {
  const handleExplorerClick = () => {
    if (chain.explorer) {
      window.open(chain.explorer, "_blank");
    }
  };

  return (
    <div className="flex items-center justify-between mb-2 p-3 rounded-md border border-border bg-card">
      <div>
        <div className="font-medium">{chain.chain}</div>
        <div className="text-sm">{formatBalance(chain.balanceEth)} ETH</div>
      </div>
      {chain.explorer && (
        <button
          onClick={handleExplorerClick}
          className="p-1 rounded-md hover:bg-accent"
          aria-label={`View ${address} on ${chain.chain} explorer`}
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
} 