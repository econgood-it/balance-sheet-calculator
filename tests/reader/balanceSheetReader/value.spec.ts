import { Value } from '../../../src/reader/balanceSheetReader/value';
import { CompanySize } from '../../../src/calculations/employees.calc';
import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';

describe('Value', () => {
  it('should be parsed as company size', async () => {
    let value = new Value('Micro-business');
    expect(value.parseAsCompanySize()).toBe(CompanySize.micro);
    value = new Value('Kleinstunternehmen');
    expect(value.parseAsCompanySize()).toBe(CompanySize.micro);

    value = new Value('Small business');
    expect(value.parseAsCompanySize()).toBe(CompanySize.small);
    value = new Value('Kleinunternehmen');
    expect(value.parseAsCompanySize()).toBe(CompanySize.small);

    value = new Value('Medium business');
    expect(value.parseAsCompanySize()).toBe(CompanySize.middle);
    value = new Value('Mittleres Unternehmen');
    expect(value.parseAsCompanySize()).toBe(CompanySize.middle);

    value = new Value('Large business');
    expect(value.parseAsCompanySize()).toBe(CompanySize.large);
    value = new Value('Grossunternehmen');
    expect(value.parseAsCompanySize()).toBe(CompanySize.large);
  });

  it('should be parsed as optional boolean', async () => {
    let value = new Value('yes');
    expect(value.parseAsOptionalBoolean()).toBeTruthy();
    value = new Value('no');
    expect(value.parseAsOptionalBoolean()).toBeFalsy();
    expect(value.parseAsOptionalBoolean()).toBeDefined();
    value = new Value('');
    expect(value.parseAsOptionalBoolean()).toBeUndefined();
  });

  it('should be parsed as country code', () => {
    let value = new Value('AFG Afghanistan');
    expect(value.countryCode).toBe('AFG');
    value = new Value('Average Africa');
    expect(value.countryCode).toBe('AAF');

    value = new Value('');
    expect(value.countryCode).toBeUndefined();
  });

  it('should be parsed as optional number', async () => {
    let value = new Value('0.93');
    expect(value.parseAsOptionalNumber().get() as number).toBe(0.93);
    value = new Value('-');
    expect(value.parseAsOptionalNumber().isPresent()).toBeFalsy();
  });

  it('with comma seperator should be parsed as number', async () => {
    const value = new Value('0,0');
    expect(value.number).toBe(0);
  });

  it('should be parsed as version', async () => {
    let value = new Value('5.04');
    value = new Value('5.06');
    expect(value.parseAsVersion()).toBe(BalanceSheetVersion.v5_0_6);
    value = new Value('5.08');
    expect(value.parseAsVersion()).toBe(BalanceSheetVersion.v5_0_8);
  });
});
