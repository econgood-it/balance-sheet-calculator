import { Workbook } from 'exceljs';
import { CellReader } from './cell.reader';
import { none, Option, some } from '../../calculations/option';
import { CalcResults } from '../../calculations/calculator';
import { CompanySize } from '../../calculations/employees.calc';

export class CalcResultsReader {
  public readFromWorkbook(wb: Workbook): Option<CalcResults> {
    const cr = new CellReader();
    const regionSheet = wb.getWorksheet('11.Region');
    if (!regionSheet) {
      return none();
    }
    return some({
      supplyCalcResults: {
        supplyRiskSum: cr.read(regionSheet, 3, 'G').number,
        supplyChainWeight: cr.read(regionSheet, 8, 'N').number,
        itucAverage: cr.read(regionSheet, 9, 'I').number,
      },
      employeesCalcResults: {
        itucAverage: 0,
        normedEmployeesRisk: 0,
        companySize: CompanySize.micro,
      },
      customerCalcResults: {
        sumOfEcologicalDesignOfProductsAndService: 0,
      },
      financeCalcResults: {
        companyIsActiveInFinancialServices: true,
        economicRatio: 0,
        economicRatioE22: 0,
        sumOfFinancialAspects: 0,
      },
      socialEnvironmentCalcResults: {
        companyIsActiveInMiningOrConstructionIndustry: true,
        profitInPercentOfTurnover: none(),
      },
    });
  }
}
