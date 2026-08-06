// Shared number/price formatting for the stock views. All guard against null so a
// missing Yahoo field renders as an em-free dash rather than "NaN".

const DASH = '–';

export function formatPrice(value, currency = 'USD') {
  if (value == null || Number.isNaN(value)) return DASH;
  const symbol = currency === 'USD' ? '$' : '';
  const decimals = Math.abs(value) >= 1000 ? 0 : Math.abs(value) < 1 ? 4 : 2;
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

// 4.54T, 57.1M, 12.3K — for market cap and volume.
export function formatCompact(value) {
  if (value == null || Number.isNaN(value)) return DASH;
  const abs = Math.abs(value);
  const units = [
    [1e12, 'T'],
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K'],
  ];
  for (const [size, suffix] of units) {
    if (abs >= size) return `${(value / size).toFixed(2)}${suffix}`;
  }
  return value.toLocaleString('en-US');
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return DASH;
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatNumber(value, decimals = 2) {
  if (value == null || Number.isNaN(value)) return DASH;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Unix seconds -> "Oct 29, 2026".
export function formatDate(unixSeconds) {
  if (!unixSeconds) return DASH;
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
