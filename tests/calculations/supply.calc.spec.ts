import {
  SupplierCalc,
  SupplyCalcResults,
} from '../../src/calculations/supplier.calc';
import { RegionProvider } from '../../src/providers/region.provider';
import { IndustryProvider } from '../../src/providers/industry.provider';

import {
  CompanyFacts,
  computeCostsOfMainOriginOfOtherSuppliers,
  SupplyFraction,
} from '../../src/models/company.facts';
import { companyFactsFactory } from '../../src/openapi/examples';
import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';

describe('Supply Calculator', () => {
  const defaultPPPIndex = 1.00304566871495;
  let companyFactsWithSupplyFractions: CompanyFacts;
  let regionProvider: RegionProvider;
  let industryProvider: IndustryProvider;
  const useNonDefaultMainOriginOfOtherSuppliers = (
    companyFacts: CompanyFacts
  ) => {
    const totalPurchaseFromSuppliers = 2000;
    return {
      ...companyFacts,
      totalPurchaseFromSuppliers,
      mainOriginOfOtherSuppliers: {
        costs: computeCostsOfMainOriginOfOtherSuppliers(
          totalPurchaseFromSuppliers,
          companyFacts.supplyFractions
        ),
        countryCode: 'BRA',
      },
    };
  };

  beforeEach(async () => {
    const supplyFractions: SupplyFraction[] = [
      { countryCode: 'AND', industryCode: 'B', costs: 100 },
      { countryCode: 'ARE', industryCode: 'Cf', costs: 200 },
      { countryCode: 'AFG', industryCode: 'Ca', costs: 300 },
      { countryCode: 'BHR', industryCode: 'J', costs: 400 },
      { countryCode: 'BHS', industryCode: 'P', costs: 500 },
    ];
    companyFactsWithSupplyFractions = {
      ...companyFactsFactory.empty(),
      totalPurchaseFromSuppliers: 1500,
      supplyFractions,
    };
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
  });

  it('should calculate ', async () => {
    const supplyCalcResults: SupplyCalcResults = await new SupplierCalc(
      regionProvider,
      industryProvider
    ).calculate(companyFactsWithSupplyFractions);
    expect(supplyCalcResults.supplyRiskSum).toBeCloseTo(2982.815370678042, 13);
    expect(supplyCalcResults.supplyChainWeight).toBeCloseTo(
      1.5930344232155826,
      13
    );
    expect(supplyCalcResults.itucAverage).toBeCloseTo(4.520531400615803, 13);
  });

  it('should calculate supply risk sum', async () => {
    const companyFacts = useNonDefaultMainOriginOfOtherSuppliers(
      companyFactsWithSupplyFractions
    );
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyCalcResults: SupplyCalcResults = new SupplierCalc(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    expect(supplyCalcResults.supplyRiskSum).toBeCloseTo(3712.7287045169523, 13);
  });

  it('should calculate supply risk of mainOriginOfOtherSuppliers', async () => {
    const companyFacts = useNonDefaultMainOriginOfOtherSuppliers(
      companyFactsWithSupplyFractions
    );
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyRiskSum = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRiskSum(companyFacts);
    const supplyRisk = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRisk(companyFacts.mainOriginOfOtherSuppliers, supplyRiskSum);
    expect(supplyRisk).toBeCloseTo(0.1965975410352198, 13);
  });
  it('should calculate ituc average', async () => {
    const companyFacts = useNonDefaultMainOriginOfOtherSuppliers(
      companyFactsWithSupplyFractions
    );
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyRiskSum = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRiskSum(companyFacts);
    const itucAverage = new SupplierCalc(
      regionProvider,
      industryProvider
    ).itucAverage(companyFacts, supplyRiskSum);
    expect(itucAverage).toBeCloseTo(4.614793748258338, 13);
  });

  it('should use default value for ituc if country code not provided in itucAverage calculation', async () => {
    const supplyFractions = [
      { countryCode: 'ABW', industryCode: 'A', costs: 20 },
      { countryCode: 'AFG', industryCode: 'B', costs: 30 },
    ];
    const totalPurchaseFromSuppliers = 89;
    // country code of main origin not provided
    const companyFacts: CompanyFacts = {
      ...companyFactsFactory.empty(),
      supplyFractions,
      totalPurchaseFromSuppliers,
      mainOriginOfOtherSuppliers: {
        costs: computeCostsOfMainOriginOfOtherSuppliers(
          totalPurchaseFromSuppliers,
          supplyFractions
        ),
      },
    };
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyRiskSum = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRiskSum(companyFacts);
    const itucAverage = new SupplierCalc(
      regionProvider,
      industryProvider
    ).itucAverage(companyFacts, supplyRiskSum);
    expect(itucAverage).toBeCloseTo(4.285944815273135, 13);
  });

  // TODO: EXCEL Limitation: Excel does not consider ITUC of country code AWO(World)
  it('should calculate ituc average if some country code is AWO', async () => {
    const companyFactsList = [
      {
        ...companyFactsFactory.empty(),
        totalPurchaseFromSuppliers: 200,
        mainOriginOfOtherSuppliers: {
          countryCode: 'AWO',
          costs: 100,
        },
      },
      {
        ...companyFactsFactory.empty(),
        totalPurchaseFromSuppliers: 200,
        supplyFractions: [
          { countryCode: 'AWO', costs: 100, industryCode: 'DEU' },
        ],
      },
    ];
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    for (const companyFacts of companyFactsList) {
      const supplyRiskSum = new SupplierCalc(
        regionProvider,
        industryProvider
      ).supplyRiskSum(companyFacts);
      const itucAverage = new SupplierCalc(
        regionProvider,
        industryProvider
      ).itucAverage(companyFacts, supplyRiskSum);
      expect(itucAverage).toBeCloseTo(2.99, 13);
    }
  });

  it('should use default ppp index if country code not provided in supplyRiskSum calculation', async () => {
    const supplyFractions = [
      { countryCode: 'ABW', industryCode: 'A', costs: 20 },
      { countryCode: 'AFG', industryCode: 'B', costs: 30 },
    ];
    const totalPurchaseFromSuppliers = 89;
    // country code of main origin not provided
    const companyFacts: CompanyFacts = {
      ...companyFactsFactory.empty(),
      supplyFractions,
      totalPurchaseFromSuppliers,
      mainOriginOfOtherSuppliers: {
        costs: computeCostsOfMainOriginOfOtherSuppliers(
          totalPurchaseFromSuppliers,
          supplyFractions
        ),
      },
    };
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyRiskSum = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRiskSum(companyFacts);
    expect(supplyRiskSum).toBeCloseTo(173.92816740603752, 13);
  });

  it('should use default ppp index if country code not provided in supplyRisk calculation', async () => {
    const supplyFraction = { industryCode: 'A', costs: 20 };
    // country code of main origin not provided
    const regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyRiskSum = 9;
    const supplyRisk = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRisk(supplyFraction, supplyRiskSum);

    expect(supplyRisk).toBeCloseTo(
      (supplyFraction.costs * defaultPPPIndex) / supplyRiskSum,
      13
    );
  });

  it('should return default value for supply chain weight if not all 5 suppliers are given', async () => {
    const companyFacts = useNonDefaultMainOriginOfOtherSuppliers({
      ...companyFactsFactory.empty(),
      supplyFractions: [
        { countryCode: 'ABW', industryCode: 'A', costs: 20 },
        { countryCode: 'AFG', industryCode: 'B', costs: 30 },
      ],
    });
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplierCalc = new SupplierCalc(regionProvider, industryProvider);
    const supplyChainWeight = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyChainWeight(companyFacts, supplierCalc.supplyRiskSum(companyFacts));
    expect(supplyChainWeight).toBe(1);
  });

  it('should return none for ecologicalSupplyChainRisk if industryCode of supply fraction is undefined', async () => {
    const ecologicalSupplyChainRisk = new SupplierCalc(
      regionProvider,
      industryProvider
    ).ecologicalSupplyChainRisk({ countryCode: 'DEU', costs: 9 });
    expect(ecologicalSupplyChainRisk).toBeUndefined();
  });

  it('should return default supply chain weight if industryCode of any supply fraction is undefined', async () => {
    const companyFacts = {
      ...companyFactsFactory.empty(),
      supplyFractions: [
        { countryCode: 'BEL', industryCode: 'A', costs: 7 },
        { countryCode: 'DEU', costs: 9 },
      ],
    };
    const dummyRiskSum = 10;
    const supplyChainWeight = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyChainWeight(companyFacts, dummyRiskSum);
    expect(supplyChainWeight).toBe(1);
  });
});
