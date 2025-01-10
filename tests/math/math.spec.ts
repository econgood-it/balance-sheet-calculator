import { roundWithPrecision } from '../../src/math';

describe('Math ', () => {
  const numberToRound = 12345.6789;

  it('roundWithPrecision round negative value to nearest integer', async () => {
    expect(roundWithPrecision(-12.5)).toBe(-13);
  });

  it('roundWithPrecision round negative value to 2 decimal place', async () => {
    expect(roundWithPrecision(-12.005, 2)).toBe(-12.01);
  });

  it('roundWithPrecision round to nearest integer', async () => {
    expect(roundWithPrecision(numberToRound)).toBe(12346);
  });

  it('roundWithPrecision round to 1 decimal place', async () => {
    expect(roundWithPrecision(numberToRound, 1)).toBe(12345.7);
  });

  it('roundWithPrecision round to 2 decimal place', async () => {
    expect(roundWithPrecision(numberToRound, 2)).toBe(12345.68);
  });

  it('roundWithPrecision round to round to nearest 10', async () => {
    expect(roundWithPrecision(numberToRound, -1)).toBe(12350);
    expect(roundWithPrecision(23, -1)).toBe(20);
    expect(roundWithPrecision(25, -1)).toBe(30);
    expect(roundWithPrecision(28, -1)).toBe(30);
    expect(roundWithPrecision(5, -1)).toBe(10);
    expect(roundWithPrecision(0, -1)).toBe(0);
    expect(roundWithPrecision(-7, -1)).toBe(-10);
  });

  it('roundWithPrecision round to round to nearest 100', async () => {
    expect(roundWithPrecision(numberToRound, -2)).toBe(12300);
  });

  it('roundWithPrecision round negative to 2 decimal place', async () => {
    expect(roundWithPrecision(-numberToRound, 2)).toBe(-12345.68);
  });
});
