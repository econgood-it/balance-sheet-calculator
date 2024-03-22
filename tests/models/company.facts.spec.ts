import {
  makeCompanyFacts,
  makeSupplyFraction,
} from '../../src/models/company.facts';

describe('Company Facts', () => {
  it('is created with default values', () => {
    const companyFacts = makeCompanyFacts();
    expect(companyFacts).toMatchObject({
      totalPurchaseFromSuppliers: 0,
      totalStaffCosts: 0,
      profit: 0,
      financialCosts: 0,
      incomeFromFinancialInvestments: 0,
      additionsToFixedAssets: 0,
      turnover: 0,
      totalAssets: 0,
      financialAssetsAndCashBalance: 0,
      numberOfEmployees: 0,
      hasCanteen: false,
      averageJourneyToWorkForStaffInKm: 0,
      isB2B: false,
      supplyFractions: [],
      employeesFractions: [],
      industrySectors: [],
      mainOriginOfOtherSuppliers: { countryCode: 'AWO', costs: 0 },
    });
  });
  it('should evaluate if all values are zero', () => {
    const companyFacts = makeCompanyFacts();
    expect(companyFacts.areAllValuesZero()).toBeTruthy();
    expect(
      companyFacts
        .withFields({ totalPurchaseFromSuppliers: 1 })
        .areAllValuesZero()
    ).toBeFalsy();
    expect(
      companyFacts
        .withFields({
          supplyFractions: [
            makeSupplyFraction({
              countryCode: 'DEU',
              costs: 1,
              industryCode: 'A',
            }),
          ],
        })
        .areAllValuesZero()
    ).toBeFalsy();
  });

  it('should override fields', () => {
    const companyFacts = makeCompanyFacts();
    const newCompanyFacts = companyFacts.withFields({
      totalPurchaseFromSuppliers: 1000,
      supplyFractions: [
        makeSupplyFraction({
          countryCode: 'DEU',
          costs: 100,
          industryCode: 'A',
        }),
      ],
    });
    expect(newCompanyFacts.totalPurchaseFromSuppliers).toBe(1000);
    expect(newCompanyFacts.supplyFractions).toMatchObject([
      {
        countryCode: 'DEU',
        costs: 100,
        industryCode: 'A',
      },
    ]);
  });
});
