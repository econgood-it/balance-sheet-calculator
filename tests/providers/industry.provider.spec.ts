import { IndustryProvider } from '../../src/providers/industry.provider';
import path from 'path';

describe('Industry Provider', () => {
  it('is created from file', async () => {
    const industryProvider = await IndustryProvider.fromFile(
      path.join(__dirname, 'industries.json')
    );
    expect(industryProvider.getOrFail('A')).toMatchObject({
      ecologicalSupplyChainRisk: 2,
      ecologicalDesignOfProductsAndServices: 1,
      industryCode: 'A',
      name: 'agriculture, forestry management, fishing industry',
    });
    expect(industryProvider.getOrFail('C')).toMatchObject({
      ecologicalSupplyChainRisk: 1.5,
      ecologicalDesignOfProductsAndServices: 1,
      industryCode: 'C',
      name: 'Manufacturing industries (not further specified)',
    });
  });
});
