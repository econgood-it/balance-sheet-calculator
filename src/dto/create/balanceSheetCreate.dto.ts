import { strictObjectMapper } from '@daniel-faber/json-ts';
import { CompanyFactsDTOCreate } from './companyFactsCreate.dto';
import { RatingDTOCreate } from './ratingCreate.dto';
import { RatingFactory } from '../../factories/rating.factory';
import { BalanceSheet } from '../../entities/balanceSheet';
import { BalanceSheetType, balanceSheetTypeFromJSON, BalanceSheetVersion, balanceSheetVersionFromJSON } from '../../entities/enums';

export class BalanceSheetDTOCreate {
  public constructor(
    public readonly type: BalanceSheetType,
    public readonly version: BalanceSheetVersion,
    public readonly companyFacts: CompanyFactsDTOCreate,
    public readonly rating: RatingDTOCreate,
  ) {
  }

  public static async fromJSON(jsonString: string): Promise<BalanceSheetDTOCreate> {
    const fromJsonSync = await strictObjectMapper(
      (accessor) => {
        const type = accessor.get('type', balanceSheetTypeFromJSON);
        const version = accessor.get('version', balanceSheetVersionFromJSON);
        const companyFacts = accessor.get('companyFacts', CompanyFactsDTOCreate.fromJSON);
        const rating = accessor.getOptional('rating', RatingDTOCreate.fromJSON);
        return {
          type,
          version,
          companyFacts,
          rating
        }
      });
    const jsonObject = fromJsonSync(jsonString);
    const ratingOfUserOrDefault = jsonObject.rating ? jsonObject.rating : await RatingFactory.createDefaultRating(BalanceSheetType.Compact,
      BalanceSheetVersion.v5_0_4);
    return new BalanceSheetDTOCreate(jsonObject.type, jsonObject.version, jsonObject.companyFacts,
      ratingOfUserOrDefault)
  }

  public toBalanceSheet(): BalanceSheet {
    return new BalanceSheet(undefined, this.type, this.version, this.companyFacts.toCompanyFacts(),
      this.rating.toRating())
  }
}

