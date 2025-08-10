import { getBtcDisplayString } from "@/lib/btc-conversion";

interface BtcDisplayProps {
  amount: string | number | bigint;
  wei?: boolean;
  showBoth?: boolean;
  btcFirst?: boolean;
  className?: string;
  precision?: number;
}

export function BtcDisplay({
  amount,
  wei = false,
  showBoth = true,
  btcFirst = true,
  className = "",
  precision = 8,
}: BtcDisplayProps) {
  const displayAmount = getBtcDisplayString(amount, {
    wei,
    showBoth,
    btcFirst,
    precision,
  });

  return <span className={className}>{displayAmount}</span>;
}
