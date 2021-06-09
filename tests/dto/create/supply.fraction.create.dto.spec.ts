import { SupplyFractionDTOCreate } from '../../../src/dto/create/supply.fraction.create.dto';

describe('Supply Fraction DTO', () => {
  it('should create DTO and return supply fraction entity', () => {
    const supplyFractionDTOCreate = SupplyFractionDTOCreate.fromJSON({
      industryCode: 'A',
      countryCode: 'DEU',
      costs: 9,
    });
    const result = supplyFractionDTOCreate.toSupplyFraction();
    expect(result.industryCode).toBe('A');
    expect(result.countryCode).toBe('DEU');
    expect(result.costs).toBe(9);
  });

  it('should create DTO using default values', () => {
    const supplyFractionDTOCreate = SupplyFractionDTOCreate.fromJSON({
      industryCode: 'A',
      countryCode: 'DEU',
    });
    const result = supplyFractionDTOCreate.toSupplyFraction();
    expect(result.industryCode).toBe('A');
    expect(result.countryCode).toBe('DEU');
    expect(result.costs).toBe(0);
  });
});
