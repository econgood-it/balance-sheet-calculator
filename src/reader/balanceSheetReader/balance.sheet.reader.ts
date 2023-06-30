import { Workbook } from 'exceljs';
import { BalanceSheetEntity } from '../../entities/balance.sheet.entity';
import { User } from '../../entities/user';
import { RatingSheet } from './rating.sheet';
import { CompanyFactsSheet } from './company.facts.sheet';
import { IntroSheet } from './intro.sheet';

export class BalanceSheetReader {
  public readFromWorkbook(wb: Workbook, users: User[]): BalanceSheetEntity {
    const introSheet = new IntroSheet(wb.getWorksheet('0. Intro'));
    const companyFactsSheet = new CompanyFactsSheet(
      wb.getWorksheet('2. Company Facts')
    );
    const ratingSheet = new RatingSheet(
      wb.getWorksheet('3. Calc'),
      introSheet.getBalanceSheetVersion()
    );
    return new BalanceSheetEntity(
      undefined,
      {
        type: ratingSheet.getBalanceSheetType(),
        version: introSheet.getBalanceSheetVersion(),
        companyFacts: companyFactsSheet.toCompanyFacts(),
        ratings: ratingSheet.toRatings(),
        stakeholderWeights: [],
      },
      users
    );
  }
}
