import {
  BalanceSheetPatchRequestBodySchema,
  BalanceSheetResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { diff } from 'deep-diff';
import {
  AfterLoad,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { z } from 'zod';
import { CalcResults, Calculator } from '../calculations/calculator';
import { RatingsUpdater } from '../calculations/ratings.updater';
import { StakeholderWeightCalculator } from '../calculations/stakeholder.weight.calculator';
import { TopicWeightCalculator } from '../calculations/topic.weight.calculator';
import { MatrixFormat } from '../dto/balance.sheet.dto';
import { DatabaseValidationError } from '../exceptions/databaseValidationError';
import { translateBalanceSheet, Translations } from '../language/translations';
import { EntityWithDtoMerger } from '../merge/entity.with.dto.merger';
import { BalanceSheetSchema, OldBalanceSheet } from '../models/oldBalanceSheet';
import { companyFactsToResponse } from '../models/oldCompanyFacts';
import { isTopic, sortRatings } from '../models/oldRating';
import { IndustryProvider } from '../providers/industry.provider';
import Provider from '../providers/provider';
import { RegionProvider } from '../providers/region.provider';
import { OrganizationEntity } from './organization.entity';

export const BALANCE_SHEET_RELATIONS = ['organizationEntity'];

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
  public balanceSheet: OldBalanceSheet;

  @ManyToOne(
    () => OrganizationEntity,
    (organizationEntity) => organizationEntity.balanceSheetEntities
  )
  public readonly organizationEntity: OrganizationEntity | undefined;

  // @ManyToOne(() => OrganizationEntity)
  // @JoinColumn({ name: 'organizationEntityId' })
  // public readonly organizationEntity: OrganizationEntity | undefined;

  @Column()
  public organizationEntityId: number | undefined;

  public constructor(id: number | undefined, balanceSheet: OldBalanceSheet) {
    this.id = id;
    this.balanceSheet = balanceSheet;
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

  public get stakeholderWeights() {
    return this.balanceSheet.stakeholderWeights;
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
    const stakeholderWeights = (
      await stakeholderWeightCalculator.calcStakeholderWeights(calcResults)
    ).merge(this.stakeholderWeights);

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
    return new BalanceSheetEntity(undefined, this.balanceSheet);
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

  public diff(otherBalanceSheet: BalanceSheetEntity) {
    const diffRatings = diff(this.ratings, otherBalanceSheet.ratings);
    const diffCompanyFacts = diff(
      this.companyFacts,
      otherBalanceSheet.companyFacts
    );

    return {
      diffRatings: diffRatings?.map((d) =>
        d.path && d.path.length >= 2 && d.path[0] === 'ratings'
          ? {
              ...d,
              shortName: this.ratings[d.path[1]].shortName,
            }
          : d
      ),
      diffCompanyFacts,
      diffVersion: diff(this.version, otherBalanceSheet.version),
      diffType: diff(this.type, otherBalanceSheet.type),
    };
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

  @AfterLoad()
  validateBalanceSheet() {
    const result = BalanceSheetSchema.strict().safeParse(this.balanceSheet);
    if (!result.success) {
      throw new DatabaseValidationError(
        result.error,
        'Column balanceSheet is not valid',
        this.id
      );
    }
  }

  public toOldBalanceSheet(): OldBalanceSheet {
    return this.balanceSheet;
  }
}
