import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user';
import { BalanceSheet } from '../models/balance.sheet';
import { companyFactsToResponse } from '../models/company.facts';
import { isTopic, sortRatings } from '../models/rating';
import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';
import { CalcResults, Calculator } from '../calculations/calculator';
import { RatingsUpdater } from '../calculations/ratings.updater';
import { StakeholderWeightCalculator } from '../calculations/stakeholder.weight.calculator';
import { TopicWeightCalculator } from '../calculations/topic.weight.calculator';
import Provider from '../providers/provider';
import { translateBalanceSheet, Translations } from '../language/translations';
import {
  BalanceSheetPatchRequestBodySchema,
  BalanceSheetResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { z } from 'zod';
import { EntityWithDtoMerger } from '../merge/entity.with.dto.merger';
import { MatrixFormat } from '../dto/balance.sheet.dto';
import { diff } from 'deep-diff';

export const BALANCE_SHEET_RELATIONS = ['users'];

type CalculationResult = {
  calcResults: CalcResults;
  stakeholderWeights: Provider<string, number>;
  topicWeights: Provider<string, number>;
};

@Entity()
export class BalanceSheetEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column({
    type: 'jsonb',
  })
  public balanceSheet: BalanceSheet;

  @ManyToMany((type) => User, (user) => user.balanceSheetEntities)
  @JoinTable({ name: 'balance_sheet_entities_users' })
  public readonly users: User[];

  public constructor(
    id: number | undefined,
    balanceSheet: BalanceSheet,
    users: User[]
  ) {
    this.id = id;
    this.balanceSheet = balanceSheet;
    this.users = users;
  }

  public get version() {
    return this.balanceSheet.version;
  }

  public get type() {
    return this.balanceSheet.type;
  }

  public get companyFacts() {
    return this.balanceSheet.companyFacts;
  }

  public get ratings() {
    return this.balanceSheet.ratings;
  }

  public userWithEmailHasAccess(userEmail: string) {
    return this.users.some((u) => u.email === userEmail);
  }

  public async reCalculate(): Promise<CalculationResult> {
    const regionProvider = await RegionProvider.fromVersion(this.version);
    const industryProvider = await IndustryProvider.fromVersion(this.version);
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(this.companyFacts);
    const ratingsUpdater: RatingsUpdater = new RatingsUpdater();
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    const topicWeightCalculator = new TopicWeightCalculator();
    const stakeholderWeights =
      await stakeholderWeightCalculator.calcStakeholderWeights(calcResults);
    const topicWeights = topicWeightCalculator.calcTopicWeights(
      calcResults,
      this.companyFacts
    );
    this.balanceSheet.ratings = await ratingsUpdater.update(
      this.ratings,
      calcResults,
      stakeholderWeights,
      topicWeights
    );
    return { calcResults, stakeholderWeights, topicWeights };
  }

  public clone(): BalanceSheetEntity {
    return new BalanceSheetEntity(undefined, this.balanceSheet, this.users);
  }

  public mergeWithPatchRequest(
    balanceSheetPatchRequestBody: z.infer<
      typeof BalanceSheetPatchRequestBodySchema
    >
  ) {
    const entityWithDTOMerger = new EntityWithDtoMerger();
    this.balanceSheet = entityWithDTOMerger.mergeBalanceSheet(
      this.balanceSheet,
      balanceSheetPatchRequestBody
    );
  }

  public asMatrixRepresentation(language: keyof Translations) {
    return new MatrixFormat(
      translateBalanceSheet(this.balanceSheet, language)
    ).apply();
  }

  public diff(otherBalanceSheet: BalanceSheet) {
    const differences = diff(this.balanceSheet, otherBalanceSheet);
    return differences?.map((d) =>
      d.path && d.path.length >= 2 && d.path[0] === 'ratings'
        ? {
            ...d,
            shortName: this.balanceSheet.ratings[d.path[1]].shortName,
          }
        : d
    );
  }

  public toJson(language: keyof Translations) {
    const transBalanceSheet = translateBalanceSheet(
      this.balanceSheet,
      language
    );
    return BalanceSheetResponseBodySchema.parse({
      id: this.id,
      ...transBalanceSheet,
      companyFacts: companyFactsToResponse(transBalanceSheet.companyFacts),
      ratings: sortRatings(
        transBalanceSheet.ratings.map((r) => ({
          ...r,
          type: isTopic(r) ? 'topic' : 'aspect',
        }))
      ),
    });
  }

  public toBalanceSheet(): BalanceSheet {
    return this.balanceSheet;
  }
}
