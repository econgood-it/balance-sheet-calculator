import { Workbook } from 'exceljs';
import { CellReader } from './cell.reader';
import { none, Option, some } from '../../calculations/option';
import { CalcResults } from '../../calculations/calculator';
import {
  INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY,
  INDUSTRY_CODE_FOR_FINANCIAL_SERVICES,
  INDUSTRY_CODE_FOR_MINING,
} from '../../entities/industry.sector';

export class CalcResultsReader {
  public readFromWorkbook(wb: Workbook): Option<CalcResults> {
    const cr = new CellReader();
    const regionSheet = wb.getWorksheet('11.Region');
    const weightingSheet = wb.getWorksheet('9. Weighting');
    const industrySheet = wb.getWorksheet('10. Industry');
    if (!regionSheet || !weightingSheet || !industrySheet) {
      return none();
    }
    const sumOfFinancialAspects =
      cr.read(weightingSheet, 19, 'I').number +
      cr.read(weightingSheet, 21, 'I').number +
      cr.read(weightingSheet, 22, 'I').number +
      cr.read(weightingSheet, 24, 'G').number;
    return some({
      supplyCalcResults: {
        supplyRiskSum: cr.read(regionSheet, 3, 'G').number,
        supplyChainWeight: cr.read(regionSheet, 8, 'N').number,
        itucAverage: cr.read(regionSheet, 9, 'I').number,
      },
      employeesCalcResults: {
        itucAverage: cr.read(regionSheet, 14, 'I').number,
        normedEmployeesRisk: cr.read(regionSheet, 10, 'G').number,
        companySize: cr.read(weightingSheet, 39, 'H').parseAsCompanySize(),
      },
      customerCalcResults: {
        sumOfEcologicalDesignOfProductsAndService: cr.read(
          industrySheet,
          38,
          'J'
        ).number,
      },
      financeCalcResults: {
        companyIsActiveInFinancialServices:
          cr.read(weightingSheet, 35, 'H').text ===
          INDUSTRY_CODE_FOR_FINANCIAL_SERVICES,
        economicRatio: cr.read(weightingSheet, 23, 'E').number,
        economicRatioE22: cr.read(weightingSheet, 22, 'E').number,
        sumOfFinancialAspects: sumOfFinancialAspects,
      },
      socialEnvironmentCalcResults: {
        companyIsActiveInMiningOrConstructionIndustry: [
          INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY,
          INDUSTRY_CODE_FOR_MINING,
        ].includes(cr.read(weightingSheet, 35, 'H').text),
        profitInPercentOfTurnover: cr
          .read(weightingSheet, 20, 'I')
          .parseAsOptionalNumber(),
      },
    });
  }
}
