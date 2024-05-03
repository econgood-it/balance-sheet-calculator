export function roundWithPrecision(value: number, precision?: number) {
  const multiplier = Math.pow(10, precision || 0);
  return (
    (Math.sign(value) * Math.round(Math.abs(value) * multiplier)) / multiplier
  );
}

export function percentageToDecimal(percentage: number) {
  return percentage / 100;
}
export function decimalToPercentage(decimal: number) {
  return decimal * 100;
}
