import { strictObjectMapper } from '@daniel-faber/json-ts';
import { CompanyFactsDTOCreate } from './companyFactsCreate.dto';
import { RatingFactory } from '../../factories/rating.factory';
import { BalanceSheet } from '../../entities/balanceSheet';
import { BalanceSheetType, balanceSheetTypeFromJSON, BalanceSheetVersion, balanceSheetVersionFromJSON } from '../../entities/enums';
import {ValidateNested} from "class-validator";

export class BalanceSheetDTOCreate {
  @ValidateNested()
  public readonly companyFacts: CompanyFactsDTOCreate;
  public constructor(
    public readonly type: BalanceSheetType,
    public readonly version: BalanceSheetVersion,
    companyFacts: CompanyFactsDTOCreate,
  ) {
    this.companyFacts = companyFacts;
  }

  public static readonly fromJSON = strictObjectMapper(
    accessor => {
      return new BalanceSheetDTOCreate(
        accessor.get('type', balanceSheetTypeFromJSON),
        accessor.get('version', balanceSheetVersionFromJSON),
        accessor.get('companyFacts', CompanyFactsDTOCreate.fromJSON)
      );
    }
  );

  public async toBalanceSheet(): Promise<BalanceSheet> {
    const rating = await RatingFactory.createDefaultRating(this.type, this.version);
    return new BalanceSheet(undefined, this.type, this.version, this.companyFacts.toCompanyFacts(),
      rating);
  }
}

