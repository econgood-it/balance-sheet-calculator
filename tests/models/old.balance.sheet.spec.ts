import {
  balanceSheetFactory,
  StakeholderWeightsFactory,
} from '../../src/openapi/examples';
import { BalanceSheetSchema } from '../../src/models/oldBalanceSheet';

describe('BalanceSheet', () => {
  it('should be parsed  where stakeholder weights defined', () => {
    const jsObject = {
      ...balanceSheetFactory.emptyFullV508(),
      stakeholderWeights: StakeholderWeightsFactory.default(),
    };
    const balanceSheet = BalanceSheetSchema.parse(jsObject);
    expect(balanceSheet).toEqual(jsObject);
  });
});
