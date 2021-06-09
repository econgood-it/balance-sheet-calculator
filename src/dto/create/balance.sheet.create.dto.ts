import { strictObjectMapper } from '@daniel-faber/json-ts';
import { CompanyFactsDTOCreate } from './company.facts.create.dto';
import { RatingFactory } from '../../factories/rating.factory';
import { BalanceSheet } from '../../entities/balanceSheet';
import {
  BalanceSheetType,
  balanceSheetTypeFromJSON,
  BalanceSheetVersion,
  balanceSheetVersionFromJSON,
} from '../../entities/enums';
import { ValidateNested } from 'class-validator';
import { Translations } from '../../entities/Translations';

export class BalanceSheetDTOCreate {
  @ValidateNested()
  public readonly companyFacts: CompanyFactsDTOCreate;

  public constructor(
    public readonly type: BalanceSheetType,
    public readonly version: BalanceSheetVersion,
    companyFacts: CompanyFactsDTOCreate
  ) {
    this.companyFacts = companyFacts;
  }

  public static readonly fromJSON = strictObjectMapper((accessor) => {
    return new BalanceSheetDTOCreate(
      accessor.get('type', balanceSheetTypeFromJSON),
      accessor.get('version', balanceSheetVersionFromJSON),
      accessor.getOptional(
        'companyFacts',
        CompanyFactsDTOCreate.fromJSON,
        CompanyFactsDTOCreate.fromJSON({})
      )
    );
  });

  public async toBalanceSheet(
    language: keyof Translations
  ): Promise<BalanceSheet> {
    const rating = await RatingFactory.createDefaultRating(
      this.type,
      this.version
    );
    return new BalanceSheet(
      undefined,
      this.type,
      this.version,
      this.companyFacts.toCompanyFacts(language),
      rating
    );
  }
}
