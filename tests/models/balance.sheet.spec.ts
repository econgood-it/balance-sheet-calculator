import {
  balanceSheetFactory,
  StakeholderWeightsFactory,
} from '../../src/openapi/examples';
import { BalanceSheetSchema } from '../../src/models/balance.sheet';

describe('BalanceSheet', () => {
  it('should be parsed where stakeholder weights undefined', () => {
    const jsObject = {
      ...balanceSheetFactory.emptyFullV508(),
      stakeholderWeights: undefined,
    };
    const balanceSheet = BalanceSheetSchema.parse(jsObject);
    expect(balanceSheet).toEqual({ ...jsObject, stakeholderWeights: [] });
  });

  it('should be parsed  where stakeholder weights defined', () => {
    const jsObject = {
      ...balanceSheetFactory.emptyFullV508(),
      stakeholderWeights: StakeholderWeightsFactory.default(),
    };
    const balanceSheet = BalanceSheetSchema.parse(jsObject);
    expect(balanceSheet).toEqual(jsObject);
  });
});
