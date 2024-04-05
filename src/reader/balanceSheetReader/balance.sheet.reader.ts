import { Workbook } from 'exceljs';
import { BalanceSheetEntity } from '../../entities/balance.sheet.entity';
import { RatingSheet } from './rating.sheet';
import { CompanyFactsSheet } from './company.facts.sheet';
import { IntroSheet } from './intro.sheet';
import { StakeholderWeightsReader } from './stakeholder.weights.reader';

export class BalanceSheetReader {
  public readFromWorkbook(wb: Workbook): BalanceSheetEntity {
    const introSheet = new IntroSheet(wb.getWorksheet('0. Intro'));
    const companyFactsSheet = new CompanyFactsSheet(
      wb.getWorksheet('2. Company Facts')
    );
    const ratingSheet = new RatingSheet(
      wb.getWorksheet('3. Calc'),
      introSheet.getBalanceSheetVersion()
    );
    const stakeholderWeights =
      new StakeholderWeightsReader().readUserSelectedFromWorkbook(wb);
    return new BalanceSheetEntity(undefined, {
      type: ratingSheet.getBalanceSheetType(),
      version: introSheet.getBalanceSheetVersion(),
      companyFacts: companyFactsSheet.toCompanyFacts(),
      ratings: ratingSheet.toRatings(),
      stakeholderWeights,
    });
  }
}
