import { Workbook } from 'exceljs';
import { CellReader } from './cell.reader';
import { OldCalcResults } from '../../calculations/oldCalculator';
import {
  INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY,
  INDUSTRY_CODE_FOR_FINANCIAL_SERVICES,
  INDUSTRY_CODE_FOR_MINING,
} from '../../models/oldCompanyFacts';

export class CalcResultsReader {
  public readFromWorkbook(wb: Workbook): OldCalcResults | undefined {
    const cr = new CellReader();
    const regionSheet = wb.getWorksheet('11.Region');
    const weightingSheet = wb.getWorksheet('9. Weighting');
    const industrySheet = wb.getWorksheet('10. Industry');
    if (!regionSheet || !weightingSheet || !industrySheet) {
      return undefined;
    }
    const sumOfFinancialAspects =
      cr.read(weightingSheet, 19, 'I').numberWithDefault0 +
      cr.read(weightingSheet, 21, 'I').numberWithDefault0 +
      cr.read(weightingSheet, 22, 'I').numberWithDefault0 +
      cr.read(weightingSheet, 24, 'G').numberWithDefault0;
    return {
      supplyCalcResults: {
        supplyRiskSum: cr.read(regionSheet, 3, 'G').numberWithDefault0,
        supplyChainWeight: cr.read(regionSheet, 8, 'N').number,
        itucAverage: cr.read(regionSheet, 9, 'I').numberWithDefault0,
      },
      employeesCalcResults: {
        itucAverage: cr.read(regionSheet, 14, 'I').numberWithDefault0,
        normedEmployeesRisk: cr.read(regionSheet, 10, 'G').numberWithDefault0,
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
        economicRatio: cr.read(weightingSheet, 23, 'E').numberWithDefault0,
        economicRatioE22: cr.read(weightingSheet, 22, 'E').number,
        sumOfFinancialAspects,
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
    };
  }
}
