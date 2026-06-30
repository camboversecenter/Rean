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
