import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { SupplyFraction } from './supplyFraction';
import { Rating } from './rating';
import { CompanyFacts } from './companyFacts';

export class BalanceSheet {
  public constructor(
    public readonly companyFacts: CompanyFacts,
    public readonly rating: Rating,
  ) { }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new BalanceSheet(
        accessor.get('companyFacts', CompanyFacts.fromJSON),
        accessor.get('rating', Rating.fromJSON)
      )
  );
}
