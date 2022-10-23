import {
  SupplierCalc,
  SupplyCalcResults,
} from '../../src/calculations/supplier.calc';
import { RegionProvider } from '../../src/providers/region.provider';
import { IndustryProvider } from '../../src/providers/industry.provider';
import { BalanceSheetVersion } from '../../src/models/balance.sheet';
import { companyFactsFactory } from '../testData/balance.sheet';
import {
  CompanyFacts,
  computeCostsOfMainOriginOfOtherSuppliers,
  SupplyFraction,
} from '../../src/models/company.facts';

describe('Supply Calculator', () => {
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
      supplyFractions,
    };
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_4
    );
    industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_4
    );
  });

  it('should calculate ', async () => {
    const supplyCalcResults: SupplyCalcResults = await new SupplierCalc(
      regionProvider,
      industryProvider
    ).calculate(companyFactsWithSupplyFractions);
    expect(supplyCalcResults.supplyRiskSum).toBeCloseTo(3197.88426323363, 13);
    expect(supplyCalcResults.supplyChainWeight).toBeCloseTo(
      1.62000609960581,
      13
    );
    expect(supplyCalcResults.itucAverage).toBeCloseTo(3.96945539178631, 13);
  });

  it('should calculate supply risk sum', async () => {
    const companyFacts = useNonDefaultMainOriginOfOtherSuppliers(
      companyFactsWithSupplyFractions
    );
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_4
    );
    const supplyCalcResults: SupplyCalcResults = new SupplierCalc(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    expect(supplyCalcResults.supplyRiskSum).toBeCloseTo(4088.020319545176, 13);
  });

  it('should calculate supply risk of mainOriginOfOtherSuppliers', async () => {
    const companyFacts = useNonDefaultMainOriginOfOtherSuppliers(
      companyFactsWithSupplyFractions
    );
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_4
    );
    const supplyRiskSum = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRiskSum(companyFacts);
    const supplyRisk = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRisk(companyFacts.mainOriginOfOtherSuppliers, supplyRiskSum);
    expect(supplyRisk).toBeCloseTo(0.21774257139959138, 13);
  });
  it('should calculate ituc average', async () => {
    const companyFacts = useNonDefaultMainOriginOfOtherSuppliers(
      companyFactsWithSupplyFractions
    );
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_4
    );
    const supplyRiskSum = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRiskSum(companyFacts);
    const itucAverage = new SupplierCalc(
      regionProvider,
      industryProvider
    ).itucAverage(companyFacts, supplyRiskSum);
    expect(itucAverage).toBeCloseTo(3.7583636819215593, 13);
  });
});
