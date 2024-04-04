import { makeCompanyFacts } from '../../src/models/company.facts';
import { makeBalanceSheet } from '../../src/models/balance.sheet';
import { makeRatingFactory } from '../../src/factories/rating.factory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { makeRating } from '../../src/models/rating';
import { makeOrganization } from '../../src/models/organization';

describe('BalanceSheet', () => {
  it('is created with default values', () => {
    const balanceSheet = makeBalanceSheet();
    expect(balanceSheet).toMatchObject({
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts: makeCompanyFacts(),
      ratings: makeRatingFactory().createDefaultRatings(
        BalanceSheetType.Full,
        BalanceSheetVersion.v5_0_8
      ),
      stakeholderWeights: [],
    });
  });
  it('returns topics', () => {
    const balanceSheet = makeBalanceSheet();
    expect(balanceSheet.getTopics().length).toBe(20);
    balanceSheet.getTopics().forEach((topic) => {
      expect(topic.isTopic()).toBeTruthy();
    });
  });

  it('returns aspects of topic', () => {
    const balanceSheet = makeBalanceSheet();
    const topics = balanceSheet.getTopics();
    const firstTopic = topics[0];
    const aspects = balanceSheet.getAspectsOfTopic(firstTopic.shortName);
    expect(aspects).toEqual([
      makeRating({
        shortName: 'A1.1',
        name: 'Working conditions and social impact in the supply chain',
        estimations: 0,
        points: 0,
        maxPoints: 50,
        weight: 1,
        isWeightSelectedByUser: false,
        isPositive: true,
      }),
      makeRating({
        shortName: 'A1.2',
        name: 'Negative aspect: violation of human dignity in the supply chain',
        estimations: 0,
        points: 0,
        maxPoints: -200,
        weight: 1,
        isWeightSelectedByUser: false,
        isPositive: false,
      }),
    ]);
  });

  it('assigns an organization', () => {
    const organization = makeOrganization().withFields({ id: 1 });
    const balanceSheet = makeBalanceSheet();
    const newBalanceSheet = balanceSheet.assignOrganization(organization);
    expect(newBalanceSheet.organizationId).toBe(1);
  });
});
