/**
 * Formats a number into Khmer Riel currency string.
 * Example: 4000 -> "4,000 ៛"
 */
const rielFormatter = new Intl.NumberFormat('km-KH', {
  style: 'currency',
  currency: 'KHR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatRiel = (amount: number): string => {
  return rielFormatter.format(amount);
};

/**
 * Formats a timestamp as a short Khmer relative time.
 * Example: "5 នាទីមុន" (5 minutes ago), "2 ម៉ោងមុន", "3 ថ្ងៃមុន";
 * older than a week falls back to the local date.
 */
export const formatTimeAgo = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return 'អម្បាញ់មិញ'; // just now
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} នាទីមុន`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ម៉ោងមុន`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ថ្ងៃមុន`;
  return date.toLocaleDateString();
};
