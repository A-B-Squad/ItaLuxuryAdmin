export const calculateProfitMargin = (
  sellingPrice: number,
  purchasePrice: number,
) => {
  if (sellingPrice === 0) {
    return 0; // Avoid division by zero
  }
  const profitMargin = ((sellingPrice - purchasePrice) / sellingPrice) * 100;
  return profitMargin.toFixed(2); // Returns the profit margin rounded to 2 decimal places
};

export const calculateEarnings = (
  sellingPrice: number,
  purchasePrice: number,
) => {
  return sellingPrice - purchasePrice;
};
