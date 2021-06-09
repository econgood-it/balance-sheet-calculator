import { IndustrySectorCreateDtoCreate } from '../../../src/dto/create/industry.sector.create.dto';
import { createTranslations } from '../../../src/entities/Translations';

describe('Industry Sector DTO', () => {
  it('should create DTO and return industry Sector entity', () => {
    const industrySectorCreateDtoCreate: IndustrySectorCreateDtoCreate =
      IndustrySectorCreateDtoCreate.fromJSON({
        industryCode: 'A',
        amountOfTotalTurnover: 0.8,
        description: 'My description',
      });
    const result = industrySectorCreateDtoCreate.toIndustrySector('en');
    expect(result.industryCode).toBe('A');
    expect(result.amountOfTotalTurnover).toBe(0.8);
    const expectedTranslations = createTranslations('en', 'My description');
    expect(result.description).toMatchObject(expectedTranslations);
  });

  it('should create DTO using default values', () => {
    const industrySectorCreateDtoCreate: IndustrySectorCreateDtoCreate =
      IndustrySectorCreateDtoCreate.fromJSON({
        industryCode: 'A',
      });
    const result = industrySectorCreateDtoCreate.toIndustrySector('en');
    expect(result.industryCode).toBe('A');
    expect(result.amountOfTotalTurnover).toBe(0);
    const expectedTranslations = createTranslations('en', '');
    expect(result.description).toMatchObject(expectedTranslations);
  });
});
