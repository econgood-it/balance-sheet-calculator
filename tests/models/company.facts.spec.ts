import {
  makeCompanyFacts,
  makeEmployeesFraction,
  makeIndustrySector,
  makeMainOriginOfOtherSuppliers,
  makeSupplyFraction,
} from '../../src/models/company.facts';
import { expect } from '@jest/globals';

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

  it('should update the costs of the main origin of other suppliers', () => {
    const companyFacts = makeCompanyFacts();
    const newCompanyFacts = companyFacts.withFields({
      totalPurchaseFromSuppliers: 1000,
      supplyFractions: [
        makeSupplyFraction({
          countryCode: 'DEU',
          costs: 100,
          industryCode: 'A',
        }),
        makeSupplyFraction({
          countryCode: 'BEL',
          costs: 200,
          industryCode: 'B',
        }),
      ],
      mainOriginOfOtherSuppliers: {
        countryCode: 'AGO',
      },
    });
    expect(newCompanyFacts.mainOriginOfOtherSuppliers).toMatchObject({
      countryCode: 'AGO',
      costs: 1000 - 100 - 200,
    });
  });

  describe('is merged with request body', () => {
    it('using profit from domain', () => {
      const companyFacts = makeCompanyFacts().withFields({
        profit: 200,
      });
      const newCompanyFacts = companyFacts.merge({});
      expect(newCompanyFacts.profit).toEqual(200);
    });

    it('using profit from dto', async () => {
      const companyFacts = makeCompanyFacts().withFields({
        profit: 200,
      });
      const newCompanyFacts = companyFacts.merge({ profit: 300 });
      expect(newCompanyFacts.profit).toEqual(300);
    });

    it('using supply fractions from domain', () => {
      const supplyFractions = [
        makeSupplyFraction({
          countryCode: 'DEU',
          costs: 100,
          industryCode: 'A',
        }),
        makeSupplyFraction({
          countryCode: 'BEL',
          costs: 200,
          industryCode: 'B',
        }),
      ];
      const companyFacts = makeCompanyFacts().withFields({
        supplyFractions,
      });
      const newCompanyFacts = companyFacts.merge({});
      expect(newCompanyFacts.supplyFractions).toEqual(supplyFractions);
    });

    it('using supply fractions from dto', () => {
      const supplyFractions = [
        makeSupplyFraction({
          countryCode: 'DEU',
          costs: 100,
          industryCode: 'A',
        }),
        makeSupplyFraction({
          countryCode: 'BEL',
          costs: 200,
          industryCode: 'B',
        }),
      ];
      const companyFacts = makeCompanyFacts().withFields({
        supplyFractions,
      });
      const newSupplyFraction = {
        countryCode: 'ALG',
        costs: 5,
        industryCode: 'Ce',
      };
      const newCompanyFacts = companyFacts.merge({
        supplyFractions: [newSupplyFraction],
      });
      expect(newCompanyFacts.supplyFractions).toEqual([
        makeSupplyFraction(newSupplyFraction),
      ]);
    });

    it('using employees fractions from domain', () => {
      const employeesFractions = [
        makeEmployeesFraction({
          countryCode: 'DEU',
          percentage: 100,
        }),
        makeEmployeesFraction({
          countryCode: 'BEL',
          percentage: 200,
        }),
      ];
      const companyFacts = makeCompanyFacts().withFields({
        employeesFractions,
      });
      const newCompanyFacts = companyFacts.merge({});
      expect(newCompanyFacts.employeesFractions).toEqual(employeesFractions);
    });

    it('using employees fractions from dto', () => {
      const employeesFractions = [
        makeEmployeesFraction({
          countryCode: 'DEU',
          percentage: 0.5,
        }),
        makeEmployeesFraction({
          countryCode: 'BEL',
          percentage: 0.9,
        }),
      ];
      const companyFacts = makeCompanyFacts().withFields({
        employeesFractions,
      });
      const newEmployeesFraction = {
        countryCode: 'ALG',
        percentage: 30,
      };
      const newCompanyFacts = companyFacts.merge({
        employeesFractions: [newEmployeesFraction],
      });
      expect(newCompanyFacts.employeesFractions).toEqual([
        makeEmployeesFraction({
          ...newEmployeesFraction,
          percentage: 0.3,
        }),
      ]);
    });
  });

  it('using totalPurchaseFromSuppliers from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      totalPurchaseFromSuppliers: 1000,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.totalPurchaseFromSuppliers).toEqual(1000);
  });

  it('using totalPurchaseFromSuppliers from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      totalPurchaseFromSuppliers: 1000,
    });
    const newCompanyFacts = companyFacts.merge({
      totalPurchaseFromSuppliers: 2000,
    });
    expect(newCompanyFacts.totalPurchaseFromSuppliers).toEqual(2000);
  });

  it('using totalStaffCosts from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      totalStaffCosts: 1000,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.totalStaffCosts).toEqual(1000);
  });

  it('using totalStaffCosts from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      totalStaffCosts: 1000,
    });
    const newCompanyFacts = companyFacts.merge({
      totalStaffCosts: 2000,
    });
    expect(newCompanyFacts.totalStaffCosts).toEqual(2000);
  });

  it('using financialCosts from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      financialCosts: 1000,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.financialCosts).toEqual(1000);
  });

  it('using financialCosts from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      financialCosts: 1000,
    });
    const newCompanyFacts = companyFacts.merge({
      financialCosts: 2000,
    });
    expect(newCompanyFacts.financialCosts).toEqual(2000);
  });

  it('using incomeFromFinancialInvestments from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      incomeFromFinancialInvestments: 1000,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.incomeFromFinancialInvestments).toEqual(1000);
  });

  it('using incomeFromFinancialInvestments from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      incomeFromFinancialInvestments: 1000,
    });
    const newCompanyFacts = companyFacts.merge({
      incomeFromFinancialInvestments: 2000,
    });
    expect(newCompanyFacts.incomeFromFinancialInvestments).toEqual(2000);
  });

  it('using additionsToFixedAssets from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      additionsToFixedAssets: 1000,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.additionsToFixedAssets).toEqual(1000);
  });

  it('using additionsToFixedAssets from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      additionsToFixedAssets: 1000,
    });
    const newCompanyFacts = companyFacts.merge({
      additionsToFixedAssets: 2000,
    });
    expect(newCompanyFacts.additionsToFixedAssets).toEqual(2000);
  });

  it('using turnover from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      turnover: 1000,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.turnover).toEqual(1000);
  });

  it('using turnover from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      turnover: 1000,
    });
    const newCompanyFacts = companyFacts.merge({
      turnover: 2000,
    });
    expect(newCompanyFacts.turnover).toEqual(2000);
  });

  it('using totalAssets from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      totalAssets: 1000,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.totalAssets).toEqual(1000);
  });

  it('using totalAssets from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      totalAssets: 1000,
    });
    const newCompanyFacts = companyFacts.merge({
      totalAssets: 2000,
    });
    expect(newCompanyFacts.totalAssets).toEqual(2000);
  });

  it('using financialAssetsAndCashBalance from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      financialAssetsAndCashBalance: 1000,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.financialAssetsAndCashBalance).toEqual(1000);
  });

  it('using financialAssetsAndCashBalance from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      financialAssetsAndCashBalance: 1000,
    });
    const newCompanyFacts = companyFacts.merge({
      financialAssetsAndCashBalance: 2000,
    });
    expect(newCompanyFacts.financialAssetsAndCashBalance).toEqual(2000);
  });

  it('using numberOfEmployees from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      numberOfEmployees: 1000,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.numberOfEmployees).toEqual(1000);
  });

  it('using numberOfEmployees from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      numberOfEmployees: 1000,
    });
    const newCompanyFacts = companyFacts.merge({
      numberOfEmployees: 2000,
    });
    expect(newCompanyFacts.numberOfEmployees).toEqual(2000);
  });

  it('using hasCanteen from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      hasCanteen: true,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.hasCanteen).toEqual(true);
  });

  it('using hasCanteen from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      hasCanteen: true,
    });
    const newCompanyFacts = companyFacts.merge({
      hasCanteen: false,
    });
    expect(newCompanyFacts.hasCanteen).toEqual(false);
  });

  it('using averageJourneyToWorkForStaffInKm from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      averageJourneyToWorkForStaffInKm: 1000,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.averageJourneyToWorkForStaffInKm).toEqual(1000);
  });

  it('using averageJourneyToWorkForStaffInKm from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      averageJourneyToWorkForStaffInKm: 1000,
    });
    const newCompanyFacts = companyFacts.merge({
      averageJourneyToWorkForStaffInKm: 2000,
    });
    expect(newCompanyFacts.averageJourneyToWorkForStaffInKm).toEqual(2000);
  });

  it('using isB2B from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      isB2B: true,
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.isB2B).toEqual(true);
  });

  it('using isB2B from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      isB2B: true,
    });
    const newCompanyFacts = companyFacts.merge({
      isB2B: false,
    });
    expect(newCompanyFacts.isB2B).toEqual(false);
  });

  it('using mainOriginOfOtherSuppliers from domain', () => {
    const companyFacts = makeCompanyFacts().withFields({
      mainOriginOfOtherSuppliers: {
        countryCode: 'DEU',
      },
    });
    const newCompanyFacts = companyFacts.merge({});
    expect(newCompanyFacts.mainOriginOfOtherSuppliers).toEqual(
      makeMainOriginOfOtherSuppliers({
        countryCode: 'DEU',
        totalPurchaseFromSuppliers: companyFacts.totalPurchaseFromSuppliers,
        supplyFractions: companyFacts.supplyFractions,
      })
    );
  });

  it('using mainOriginOfOtherSuppliers from dto', () => {
    const companyFacts = makeCompanyFacts().withFields({
      mainOriginOfOtherSuppliers: {
        countryCode: 'DEU',
      },
    });
    const newCompanyFacts = companyFacts.merge({
      totalPurchaseFromSuppliers: 1000,
      mainOriginOfOtherSuppliers: 'BEL',
    });
    expect(newCompanyFacts.mainOriginOfOtherSuppliers).toEqual(
      makeMainOriginOfOtherSuppliers({
        countryCode: 'BEL',
        totalPurchaseFromSuppliers: 1000,
        supplyFractions: companyFacts.supplyFractions,
      })
    );
  });

  describe('should return company facts as json', () => {
    it('and transforms percentage back to decimals', () => {
      const companyFacts = makeCompanyFacts({
        ...makeCompanyFacts(),
        employeesFractions: [
          makeEmployeesFraction({ countryCode: 'ARE', percentage: 0.3 }),
          makeEmployeesFraction({ percentage: 0.5 }),
        ],
        industrySectors: [
          makeIndustrySector({
            industryCode: 'A',
            amountOfTotalTurnover: 0.7,
            description: '',
          }),
        ],
      });
      const json = companyFacts.toJson();
      expect(json.employeesFractions).toEqual([
        { countryCode: 'ARE', percentage: 30 },
        { percentage: 50 },
      ]);
      expect(json.industrySectors).toEqual([
        { industryCode: 'A', amountOfTotalTurnover: 70, description: '' },
      ]);
    });

    it('where country code of some suppliers is missing', () => {
      const companyFacts = makeCompanyFacts({
        ...makeCompanyFacts(),
        supplyFractions: [
          makeSupplyFraction({
            countryCode: 'ARE',
            industryCode: 'A',
            costs: 9,
          }),
          makeSupplyFraction({ industryCode: 'Be', costs: 7 }),
        ],
        mainOriginOfOtherSuppliers: { countryCode: 'DEU' },
      });
      const companyFactsResponse = companyFacts.toJson();
      expect(
        companyFactsResponse.supplyFractions.some(
          (s) => s.countryCode === undefined
        )
      ).toBeTruthy();
    });
    it('where country code of some employees is missing', () => {
      const companyFacts = makeCompanyFacts({
        ...makeCompanyFacts(),
        employeesFractions: [
          makeEmployeesFraction({ countryCode: 'ARE', percentage: 0.3 }),
          makeEmployeesFraction({ percentage: 0.5 }),
        ],
        mainOriginOfOtherSuppliers: { countryCode: 'DEU' },
      });
      const companyFactsResponse = companyFacts.toJson();

      expect(
        companyFactsResponse.employeesFractions.some(
          (s) => s.countryCode === undefined
        )
      ).toBeTruthy();
    });
    it('where hasCanteen is undefined', () => {
      const companyFacts = makeCompanyFacts({
        ...makeCompanyFacts(),
        hasCanteen: undefined,
      });
      const companyFactsResponse = companyFacts.toJson();
      expect(companyFactsResponse.hasCanteen).toBeUndefined();
    });
    it('where country code of main origin of suppliers is not provided', () => {
      const companyFacts = makeCompanyFacts({
        ...makeCompanyFacts(),
        mainOriginOfOtherSuppliers: { countryCode: undefined },
      });
      const companyFactsResponse = companyFacts.toJson();
      expect(
        companyFactsResponse.mainOriginOfOtherSuppliers.countryCode
      ).toBeUndefined();
    });
  });

  it('creates company facts from json', () => {
    const json = {
      totalPurchaseFromSuppliers: 1000,
      totalStaffCosts: 2000,
      profit: 3000,
      financialCosts: 4000,
      incomeFromFinancialInvestments: 5000,
      additionsToFixedAssets: 6000,
      turnover: 7000,
      totalAssets: 8000,
      financialAssetsAndCashBalance: 9000,
      numberOfEmployees: 10000,
      hasCanteen: true,
      averageJourneyToWorkForStaffInKm: 11000,
      isB2B: false,
      supplyFractions: [
        {
          countryCode: 'DEU',
          industryCode: 'A',
          costs: 100,
        },
      ],
      employeesFractions: [
        {
          countryCode: 'ARE',
          percentage: 30,
        },
        {
          percentage: 50,
        },
      ],
      industrySectors: [
        {
          industryCode: 'A',
          amountOfTotalTurnover: 70,
          description: '',
        },
      ],
      mainOriginOfOtherSuppliers: 'DEU',
    };
    const companyFacts = makeCompanyFacts.fromJson(json);
    expect(companyFacts.supplyFractions).toEqual([
      makeSupplyFraction({
        countryCode: 'DEU',
        industryCode: 'A',
        costs: 100,
      }),
    ]);
    expect(companyFacts.employeesFractions).toEqual([
      makeEmployeesFraction({ countryCode: 'ARE', percentage: 0.3 }),
      makeEmployeesFraction({ percentage: 0.5 }),
    ]);
    expect(companyFacts.industrySectors).toEqual([
      makeIndustrySector({
        industryCode: 'A',
        amountOfTotalTurnover: 0.7,
        description: '',
      }),
    ]);
    expect(companyFacts.mainOriginOfOtherSuppliers).toEqual(
      makeMainOriginOfOtherSuppliers({
        countryCode: 'DEU',
        totalPurchaseFromSuppliers: 1000,
        supplyFractions: companyFacts.supplyFractions,
      })
    );
  });
});
