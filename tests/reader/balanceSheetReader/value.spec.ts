import { Value } from '../../../src/reader/balanceSheetReader/value';
import { CompanySize } from '../../../src/calculations/employees.calc';
import { BalanceSheetVersion } from '../../../src/entities/enums';

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

  it('should be parsed as optional number', async () => {
    let value = new Value('0.93');
    expect(value.parseAsOptionalNumber().get() as number).toBe(0.93);
    value = new Value('-');
    expect(value.parseAsOptionalNumber().isPresent()).toBeFalsy();
  });

  it('should be parsed as version', async () => {
    let value = new Value('5.04');
    expect(value.parseAsVersion()).toBe(BalanceSheetVersion.v5_0_4);
    value = new Value('5.05');
    expect(value.parseAsVersion()).toBe(BalanceSheetVersion.v5_0_5);
    value = new Value('5.06');
    expect(value.parseAsVersion()).toBe(BalanceSheetVersion.v5_0_6);
    value = new Value('5.07');
    expect(value.parseAsVersion()).toBe(BalanceSheetVersion.v5_0_7);
    value = new Value('5.08');
    expect(value.parseAsVersion()).toBe(BalanceSheetVersion.v5_0_8);
  });
});
