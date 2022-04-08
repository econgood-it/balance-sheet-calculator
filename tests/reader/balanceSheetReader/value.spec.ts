import { Value } from '../../../src/reader/balanceSheetReader/value';
import { CompanySize } from '../../../src/calculations/employees.calc';

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
});
