import * as path from 'path';

import { Workbook } from 'exceljs';
import { CalcResultsReader } from '../../../src/reader/balanceSheetReader/calc.results.reader';
import { CalcResults } from '../../../src/calculations/calculator';
import { CompanySize } from '../../../src/calculations/employees.calc';

describe('CalcResults', () => {
  it('should read calc results from excel', async () => {
    const calcResultsReader = new CalcResultsReader();
    const pathToCsv = path.join(__dirname, 'full_5_0_7_unprotected.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);
    const optionalCalcResults = calcResultsReader.readFromWorkbook(wb);
    expect(optionalCalcResults.isPresent()).toBeTruthy();
    const calcResults = optionalCalcResults.get() as CalcResults;
    expect(calcResults.supplyCalcResults.itucAverage).toBe(3.14683426200569);
    expect(calcResults.supplyCalcResults.supplyChainWeight).toBe(1);
    expect(calcResults.supplyCalcResults.supplyRiskSum).toBe(33033.8400024077);

    expect(calcResults.financeCalcResults.sumOfFinancialAspects).toBe(7597);
    expect(calcResults.financeCalcResults.economicRatioE22).toBe(1.7);
    expect(calcResults.financeCalcResults.economicRatio).toBe(1.55431654676259);
    expect(
      calcResults.financeCalcResults.companyIsActiveInFinancialServices
    ).toBeFalsy();

    expect(calcResults.employeesCalcResults.itucAverage).toBe(2.91);
    expect(calcResults.employeesCalcResults.companySize).toBe(
      CompanySize.small
    );
    expect(calcResults.employeesCalcResults.normedEmployeesRisk).toBe(
      79181.6338864915
    );

    // expect(calcResults..normedEmployeesRisk).toBe(
    //   79181.6338864915
    // );
  });
});
