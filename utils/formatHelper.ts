/**
 * Formats a number into Khmer Riel currency string.
 * Example: 4000 -> "4,000 ៛"
 */
export const formatRiel = (amount: number): string => {
  return new Intl.NumberFormat('km-KH', {
    style: 'currency',
    currency: 'KHR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
