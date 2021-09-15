import { MainOriginOfOtherSuppliers } from '../../../src/entities/main.origin.of.other.suppliers';
import { MainOriginOfOtherSuppliersDTOResponse } from '../../../src/dto/response/main.origin.of.other.suppliers.response.dto';

describe('MainOriginOfOtherSuppliersesponseDTO', () => {
  it('is created from main origin of other suppliers', async () => {
    const mainOriginOfOtherSuppliers = new MainOriginOfOtherSuppliers(
      undefined,
      'DEU',
      400
    );
    const mainOriginOfOtherSuppliersDTOResponse =
      MainOriginOfOtherSuppliersDTOResponse.fromMainOriginOfOtherSuppliers(
        mainOriginOfOtherSuppliers,
        'de'
      );
    expect(mainOriginOfOtherSuppliersDTOResponse).toBeDefined();
    expect(mainOriginOfOtherSuppliersDTOResponse).toMatchObject({
      countryCode: 'DEU',
      costs: 400,
    });
  });
});
