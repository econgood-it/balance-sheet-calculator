import * as path from 'path';

import { Workbook } from 'exceljs';
import { CalcResultsReader } from '../../src/reader/balanceSheetReader/calc.results.reader';
import { CalcResults } from '../../src/calculations/calculator';

describe('CalcResults', () => {
  it('should read calc results from excel', async () => {
    const calcResultsReader = new CalcResultsReader();
    const pathToCsv = path.join(__dirname, 'full_5_0_7_unprotected.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);
    const optionalCalcResults = calcResultsReader.readFromWorkbook(wb);
    expect(optionalCalcResults.isPresent()).toBeTruthy();
    const calcResults = optionalCalcResults.get() as CalcResults;
    expect(calcResults.supplyCalcResults.itucAverage).toBe(2.99);
    expect(calcResults.supplyCalcResults.supplyChainWeight).toBe(1);
    expect(calcResults.supplyCalcResults.supplyRiskSum).toBe(30091.3700614485);
  });
});
