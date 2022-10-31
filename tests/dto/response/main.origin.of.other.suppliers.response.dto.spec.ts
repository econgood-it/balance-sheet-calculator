import { MainOriginOfOtherSuppliersDTOResponse } from '../../../src/dto/response/main.origin.of.other.suppliers.response.dto';
import { MainOriginOfOtherSuppliers } from '../../../src/models/company.facts';

describe('MainOriginOfOtherSuppliersesponseDTO', () => {
  it('is created from main origin of other suppliers', async () => {
    const mainOriginOfOtherSuppliers: MainOriginOfOtherSuppliers = {
      countryCode: 'DEU',
      costs: 400,
    };
    const mainOriginOfOtherSuppliersDTOResponse =
      MainOriginOfOtherSuppliersDTOResponse.fromMainOriginOfOtherSuppliers(
        mainOriginOfOtherSuppliers
      );
    expect(mainOriginOfOtherSuppliersDTOResponse).toBeDefined();
    expect(mainOriginOfOtherSuppliersDTOResponse).toMatchObject({
      countryCode: 'DEU',
      costs: 400,
    });
  });
});
