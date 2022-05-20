import { IndustryReader } from '../../src/reader/industry.reader';
import { Industry } from '../../src/entities/industry';
import path from 'path';

describe('Industry Reader', () => {
  it('should read industry.csv', async () => {
    const regionReader = new IndustryReader();
    const pathToCsv = path.join(
      path.resolve(__dirname, '../../src/files/reader'),
      'industry.csv'
    );

    const industries: Industry[] = await regionReader.read(pathToCsv);
    expect(industries).toContainEqual({
      industryCode: 'A',
      ecologicalSupplyChainRisk: 2,
      ecologicalDesignOfProductsAndServices: 1,
      id: undefined,
      name: 'agriculture, forestry management, fishing industry',
    });
    expect(industries).toContainEqual({
      industryCode: 'Ce',
      ecologicalSupplyChainRisk: 1.5,
      ecologicalDesignOfProductsAndServices: 1.5,
      id: undefined,
      name: 'Pharmaceutical products and preparations (C21)',
    });

    expect(industries).toContainEqual({
      industryCode: 'Cf',
      ecologicalSupplyChainRisk: 1.5,
      ecologicalDesignOfProductsAndServices: 1,
      id: undefined,
      name: 'Production of non-metallic minerals (C23)',
    });

    expect(industries).toContainEqual({
      industryCode: 'T',
      ecologicalSupplyChainRisk: 1,
      ecologicalDesignOfProductsAndServices: 1,
      id: undefined,
      name: 'Please enter',
    });
  });
});
