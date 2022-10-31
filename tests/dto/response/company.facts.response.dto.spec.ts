import { CompanyFactsDTOResponse } from '../../../src/dto/response/company.facts.response.dto';
import { companyFactsFactory } from '../../testData/balance.sheet';

describe('CompanyFactsResponseDTO', () => {
  it('is created from company facts', async () => {
    const companyFacts = companyFactsFactory.nonEmpty();
    const companyFactsDTOResponse =
      CompanyFactsDTOResponse.fromCompanyFacts(companyFacts);
    expect(companyFactsDTOResponse).toBeDefined();
    expect(companyFactsDTOResponse).toMatchObject({
      totalPurchaseFromSuppliers:
        companyFactsFactory.nonEmpty().totalPurchaseFromSuppliers,
      mainOriginOfOtherSuppliers: {
        costs: companyFactsFactory.nonEmpty().mainOriginOfOtherSuppliers.costs,
        countryCode:
          companyFactsFactory.nonEmpty().mainOriginOfOtherSuppliers.countryCode,
      },
    });
  });
});
