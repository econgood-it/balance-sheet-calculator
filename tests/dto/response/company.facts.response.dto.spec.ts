import { CompanyFacts1 } from '../../testData/company.facts';
import { CompanyFactsDTOResponse } from '../../../src/dto/response/company.facts.response.dto';

jest.mock('../../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) => 'Menschenwürde in der Zulieferkette',
}));

describe('CompanyFactsResponseDTO', () => {
  it('is created from company facts', async () => {
    const companyFacts = CompanyFacts1;
    const companyFactsDTOResponse = CompanyFactsDTOResponse.fromCompanyFacts(
      companyFacts,
      'de'
    );
    expect(companyFactsDTOResponse).toBeDefined();
    expect(companyFactsDTOResponse).toMatchObject({
      totalPurchaseFromSuppliers: CompanyFacts1.totalPurchaseFromSuppliers,
      mainOriginOfOtherSuppliers: {
        costs: CompanyFacts1.mainOriginOfOtherSuppliers.costs,
        countryCode: CompanyFacts1.mainOriginOfOtherSuppliers.countryCode,
      },
    });
  });
});
