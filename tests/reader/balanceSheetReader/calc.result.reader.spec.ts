import * as path from 'path';

import { Workbook } from 'exceljs';
import { CalcResultsReader } from '../../../src/reader/balanceSheetReader/calc.results.reader';
import { CompanySize } from '../../../src/calculations/old.employees.calc';

describe('CalcResults', () => {
  it('should read calc results from excel', async () => {
    const calcResultsReader = new CalcResultsReader();
    const pathToCsv = path.join(__dirname, 'full_5_0_8.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);
    const calcResults = calcResultsReader.readFromWorkbook(wb);
    expect(calcResults).toBeDefined();
    expect(calcResults?.supplyCalcResults.itucAverage).toBe(4.495863381753423);
    expect(calcResults?.supplyCalcResults.supplyChainWeight).toBe(1);
    expect(calcResults?.supplyCalcResults.supplyRiskSum).toBe(
      378978.68129707774
    );

    expect(calcResults?.financeCalcResults.sumOfFinancialAspects).toBe(
      456457622
    );
    expect(calcResults?.financeCalcResults.economicRatioE22).toBe(
      1.6904761904761905
    );
    expect(calcResults?.financeCalcResults.economicRatio).toBe(
      0.29523809523809524
    );
    expect(
      calcResults?.financeCalcResults.companyIsActiveInFinancialServices
    ).toBeFalsy();

    expect(calcResults?.employeesCalcResults.itucAverage).toBe(2.39);
    expect(calcResults?.employeesCalcResults.companySize).toBe(
      CompanySize.micro
    );
    expect(calcResults?.employeesCalcResults.normedEmployeesRisk).toBe(
      12680.061621592793
    );

    expect(
      calcResults?.customerCalcResults.sumOfEcologicalDesignOfProductsAndService
    ).toBe(1.065);

    expect(
      calcResults?.socialEnvironmentCalcResults.profitInPercentOfTurnover.get() as number
    ).toBe(3681100.4516129033);
    expect(
      calcResults?.socialEnvironmentCalcResults
        .companyIsActiveInMiningOrConstructionIndustry
    ).toBeFalsy();
  });
});
