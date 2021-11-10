export const roundWithPrecision = (value: number, precision?: number) => {
  const multiplier = Math.pow(10, precision || 0);
  return (
    (Math.sign(value) * Math.round(Math.abs(value) * multiplier)) / multiplier
  );
};
