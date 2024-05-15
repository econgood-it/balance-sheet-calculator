import { RegionProvider } from '../../src/providers/region.provider';
import { IndustryProvider } from '../../src/providers/industry.provider';
import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import {
  makeCompanyFacts,
  makeMainOriginOfOtherSuppliers,
  makeSupplyFraction,
} from '../../src/models/company.facts';
import { makeSupplierCalc } from '../../src/calculations/supplier.calc';

describe('Supply Calculator', () => {
  const defaultPPPIndex = 1.00304566871495;
  const supplyFractions = [
    makeSupplyFraction({ countryCode: 'AND', industryCode: 'B', costs: 100 }),
    makeSupplyFraction({ countryCode: 'ARE', industryCode: 'Cf', costs: 200 }),
    makeSupplyFraction({ countryCode: 'AFG', industryCode: 'Ca', costs: 300 }),
    makeSupplyFraction({ countryCode: 'BHR', industryCode: 'J', costs: 400 }),
    makeSupplyFraction({ countryCode: 'BHS', industryCode: 'P', costs: 500 }),
  ];
  const companyFactsWithSupplyFractions = makeCompanyFacts().withFields({
    totalPurchaseFromSuppliers: 1500,
    supplyFractions,
  });
  const nonDefaultMainOriginOfOtherSuppliers =
    companyFactsWithSupplyFractions.withFields({
      totalPurchaseFromSuppliers: 2000,
      mainOriginOfOtherSuppliers: {
        countryCode: 'BRA',
      },
    });
  let regionProvider: RegionProvider;
  let industryProvider: IndustryProvider;

  beforeEach(async () => {
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
  });

  it('should calculate ', async () => {
    const supplyCalcResults = makeSupplierCalc(
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
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyCalcResults = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculate(nonDefaultMainOriginOfOtherSuppliers);
    expect(supplyCalcResults.supplyRiskSum).toBeCloseTo(3712.7287045169523, 13);
  });

  it('should calculate supply risk of mainOriginOfOtherSuppliers', async () => {
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyRiskSum = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculateSupplyRiskSum(nonDefaultMainOriginOfOtherSuppliers);
    const supplyRisk = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculateSupplyRisk(
      nonDefaultMainOriginOfOtherSuppliers.mainOriginOfOtherSuppliers,
      supplyRiskSum
    );
    expect(supplyRisk).toBeCloseTo(0.1965975410352198, 13);
  });
  it('should calculate ituc average', async () => {
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyRiskSum = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculateSupplyRiskSum(nonDefaultMainOriginOfOtherSuppliers);
    const itucAverage = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculateItucAverage(nonDefaultMainOriginOfOtherSuppliers, supplyRiskSum);
    expect(itucAverage).toBeCloseTo(4.614793748258338, 13);
  });

  it('should use default value for ituc if country code not provided in itucAverage calculation', async () => {
    const supplyFractions = [
      makeSupplyFraction({ countryCode: 'ABW', industryCode: 'A', costs: 20 }),
      makeSupplyFraction({ countryCode: 'AFG', industryCode: 'B', costs: 30 }),
    ];
    const totalPurchaseFromSuppliers = 89;
    // country code of main origin not provided
    const companyFacts = makeCompanyFacts().withFields({
      supplyFractions,
      totalPurchaseFromSuppliers,
      mainOriginOfOtherSuppliers: makeMainOriginOfOtherSuppliers({
        totalPurchaseFromSuppliers,
        supplyFractions,
      }),
    });
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyRiskSum = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculateSupplyRiskSum(companyFacts);
    const itucAverage = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculateItucAverage(companyFacts, supplyRiskSum);
    expect(itucAverage).toBeCloseTo(4.285944815273135, 13);
  });

  // TODO: EXCEL Limitation: Excel does not consider ITUC of country code AWO(World)
  it('should calculate ituc average if some country code is AWO', async () => {
    const companyFactsList = [
      makeCompanyFacts().withFields({
        totalPurchaseFromSuppliers: 200,
        mainOriginOfOtherSuppliers: {
          countryCode: 'AWO',
        },
      }),
      makeCompanyFacts().withFields({
        totalPurchaseFromSuppliers: 200,
        supplyFractions: [
          makeSupplyFraction({
            countryCode: 'AWO',
            costs: 100,
            industryCode: 'DEU',
          }),
        ],
      }),
    ];
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    for (const companyFacts of companyFactsList) {
      const supplyRiskSum = makeSupplierCalc(
        regionProvider,
        industryProvider
      ).calculateSupplyRiskSum(companyFacts);
      const itucAverage = makeSupplierCalc(
        regionProvider,
        industryProvider
      ).calculateItucAverage(companyFacts, supplyRiskSum);
      expect(itucAverage).toBeCloseTo(2.99, 13);
    }
  });

  it('should use default ppp index if country code not provided in supplyRiskSum calculation', async () => {
    const supplyFractions = [
      makeSupplyFraction({ countryCode: 'ABW', industryCode: 'A', costs: 20 }),
      makeSupplyFraction({ countryCode: 'AFG', industryCode: 'B', costs: 30 }),
    ];
    const totalPurchaseFromSuppliers = 89;
    // country code of main origin not provided
    const companyFacts = makeCompanyFacts().withFields({
      supplyFractions,
      totalPurchaseFromSuppliers,
    });
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyRiskSum = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculateSupplyRiskSum(companyFacts);
    expect(supplyRiskSum).toBeCloseTo(173.92816740603752, 13);
  });

  it('should use default ppp index if country code not provided in supplyRisk calculation', async () => {
    const supplyFraction = makeSupplyFraction({ industryCode: 'A', costs: 20 });
    // country code of main origin not provided
    const regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplyRiskSum = 9;
    const supplyRisk = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculateSupplyRisk(supplyFraction, supplyRiskSum);

    expect(supplyRisk).toBeCloseTo(
      (supplyFraction.costs * defaultPPPIndex) / supplyRiskSum,
      13
    );
  });

  it('should return default value for supply chain weight if not all 5 suppliers are given', async () => {
    const companyFacts = nonDefaultMainOriginOfOtherSuppliers.withFields({
      supplyFractions: [
        makeSupplyFraction({
          countryCode: 'ABW',
          industryCode: 'A',
          costs: 20,
        }),
        makeSupplyFraction({
          countryCode: 'AFG',
          industryCode: 'B',
          costs: 30,
        }),
      ],
    });
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const supplierCalc = makeSupplierCalc(regionProvider, industryProvider);
    const supplyChainWeight = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculateSupplyChainWeight(
      companyFacts,
      supplierCalc.calculateSupplyRiskSum(companyFacts)
    );
    expect(supplyChainWeight).toBe(1);
  });

  it('should return none for ecologicalSupplyChainRisk if industryCode of supply fraction is undefined', async () => {
    const ecologicalSupplyChainRisk = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculateEcologicalSupplyChainRisk(
      makeSupplyFraction({ countryCode: 'DEU', costs: 9 })
    );
    expect(ecologicalSupplyChainRisk).toBeUndefined();
  });

  it('should return default supply chain weight if industryCode of any supply fraction is undefined', async () => {
    const companyFacts = makeCompanyFacts().withFields({
      supplyFractions: [
        makeSupplyFraction({ countryCode: 'BEL', industryCode: 'A', costs: 7 }),
        makeSupplyFraction({ countryCode: 'DEU', costs: 9 }),
      ],
    });
    const dummyRiskSum = 10;
    const supplyChainWeight = makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculateSupplyChainWeight(companyFacts, dummyRiskSum);
    expect(supplyChainWeight).toBe(1);
  });
});
