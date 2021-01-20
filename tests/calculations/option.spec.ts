import {CompanyFacts} from "../../src/entities/companyFacts";
import {FinanceCalc, FinanceCalcResults} from "../../src/calculations/finance.calc";
import {EmptyCompanyFacts} from "../testData/company.facts";
import {none, some} from "../../src/calculations/option";


describe('Option', () => {

  it('should return value on getOrElse',  () => {
    const option = some(4);
    expect(option.getOrElse(7)).toBe(4);
  })

  it('should return default value on getOrElse',  () => {
    const option = none();
    expect(option.getOrElse(7)).toBe(7);
  })

  it('should return value on get',  () => {
    const option = some(4);
    expect(option.get()).toBe(4);
  })

  it('should return undefined on getOrElse',  () => {
    const option = none();
    expect(option.get()).toBeUndefined();
  })

  it('should return true for isPresent ',  () => {
    const option = some(4);
    expect(option.isPresent()).toBeTruthy();
  })

  it('should return false for isPresent ',  () => {
    const option = none();
    expect(option.isPresent()).toBeFalsy();
  })

})