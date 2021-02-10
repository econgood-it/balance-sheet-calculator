import {roundWithPrecision} from "../../src/math";


describe('Math ', () => {

  const numberToRound = 12345.6789;

  it('roundWithPrecision round to nearest integer',  async (done) => {
    expect(roundWithPrecision(numberToRound)).toBe(12346);
    done()
  })

  it('roundWithPrecision round to 1 decimal place',  async (done) => {
    expect(roundWithPrecision(numberToRound, 1)).toBe(12345.7);
    done()
  })

  it('roundWithPrecision round to 2 decimal place',  async (done) => {
    expect(roundWithPrecision(numberToRound, 2)).toBe(12345.68);
    done()
  })

  it('roundWithPrecision round to round to nearest 10',  async (done) => {
    expect(roundWithPrecision(numberToRound, -1)).toBe(12350);
    done()
  })

  it('roundWithPrecision round to round to nearest 100',  async (done) => {
    expect(roundWithPrecision(numberToRound, -2)).toBe(12300);
    done()
  })

  it('roundWithPrecision round negative to 2 decimal place',  async (done) => {
    expect(roundWithPrecision(-numberToRound, 2)).toBe(-12345.68);
    done()
  })

})