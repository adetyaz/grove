/**
 * BTC to USD conversion utility
 * Uses a mock conversion rate for development
 * In production, this would connect to a real API like CoinGecko
 */

// Mock conversion rate - in production, fetch from API
const MOCK_BTC_TO_USD = 43250; // Current approximate BTC price

interface ConversionOptions {
  showBoth?: boolean;
  btcFirst?: boolean;
  precision?: number;
}

export function formatBtcAmount(
  btcAmount: string | number,
  options: ConversionOptions = {}
) {
  const { showBoth = true, btcFirst = true, precision = 8 } = options;

  const btc = typeof btcAmount === "string" ? parseFloat(btcAmount) : btcAmount;
  const usd = btc * MOCK_BTC_TO_USD;

  const btcFormatted = btc.toFixed(precision);
  const usdFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd);

  if (!showBoth) {
    return btcFirst ? `${btcFormatted} BTC` : usdFormatted;
  }

  return btcFirst
    ? `${btcFormatted} BTC (${usdFormatted})`
    : `${usdFormatted} (${btcFormatted} BTC)`;
}

export function formatWeiToBtc(weiAmount: string | bigint) {
  const wei = typeof weiAmount === "string" ? BigInt(weiAmount) : weiAmount;
  const btc = Number(wei) / 1e18;
  return formatBtcAmount(btc);
}

export function getBtcToUsdRate() {
  return MOCK_BTC_TO_USD;
}

export function convertBtcToUsd(btcAmount: string | number) {
  const btc = typeof btcAmount === "string" ? parseFloat(btcAmount) : btcAmount;
  return btc * MOCK_BTC_TO_USD;
}

export function convertUsdToBtc(usdAmount: string | number) {
  const usd = typeof usdAmount === "string" ? parseFloat(usdAmount) : usdAmount;
  return usd / MOCK_BTC_TO_USD;
}

// Utility function to get display string for components
export function getBtcDisplayString(
  amount: string | number | bigint,
  options: ConversionOptions & { wei?: boolean } = {}
) {
  const { wei = false, ...conversionOptions } = options;

  return wei
    ? formatWeiToBtc(amount as string | bigint)
    : formatBtcAmount(amount as string | number, conversionOptions);
}
