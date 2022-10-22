import { IndustrySectorCreateDtoCreate } from '../../../src/dto/create/industry.sector.create.dto';

describe('Industry Sector DTO', () => {
  it('should create DTO and return industry Sector entity', () => {
    const industrySectorCreateDtoCreate: IndustrySectorCreateDtoCreate =
      IndustrySectorCreateDtoCreate.fromJSON({
        industryCode: 'A',
        amountOfTotalTurnover: 0.8,
        description: 'My description',
      });
    const result = industrySectorCreateDtoCreate.toIndustrySector();
    expect(result.industryCode).toBe('A');
    expect(result.amountOfTotalTurnover).toBe(0.8);
    expect(result.description).toBe('My description');
  });

  it('should create DTO using default values', () => {
    const industrySectorCreateDtoCreate: IndustrySectorCreateDtoCreate =
      IndustrySectorCreateDtoCreate.fromJSON({
        industryCode: 'A',
      });
    const result = industrySectorCreateDtoCreate.toIndustrySector();
    expect(result.industryCode).toBe('A');
    expect(result.amountOfTotalTurnover).toBe(0);
    expect(result.description).toBe('');
  });
});
