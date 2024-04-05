import { EntityManager } from 'typeorm';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { BalanceSheet, makeBalanceSheet } from '../models/balance.sheet';
import {
  makeCompanyFacts,
  makeEmployeesFraction,
  makeIndustrySector,
  makeMainOriginOfOtherSuppliers,
  makeSupplyFraction,
} from '../models/company.facts';
import { makeRating } from '../models/rating';
import deepFreeze from 'deep-freeze';
import { Organization } from '../models/organization';
import { BalanceSheetDBSchema } from '../entities/schemas/balance.sheet.schema';

export interface IBalanceSheetRepo {
  findByIdOrFail(id: number): Promise<BalanceSheet>;
  findByOrganization(organization: Organization): Promise<BalanceSheet[]>;
  save(balanceSheet: BalanceSheet): Promise<BalanceSheet>;
  remove(balanceSheet: BalanceSheet): Promise<BalanceSheet>;
}

export function makeBalanceSheetRepository(
  manager: EntityManager
): IBalanceSheetRepo {
  const repo = manager.getRepository(BalanceSheetEntity);

  async function findByIdOrFail(id: number): Promise<BalanceSheet> {
    const balanceSheetEntity = await repo.findOneOrFail({
      where: { id },
      loadRelationIds: true,
    });
    return convertToBalanceSheet(balanceSheetEntity);
  }

  async function findByOrganization(
    organization: Organization
  ): Promise<BalanceSheet[]> {
    const balanceSheetEntities = await repo.find({
      where: { organizationEntityId: organization.id },
      loadRelationIds: true,
    });
    return balanceSheetEntities.map(convertToBalanceSheet);
  }

  async function save(balanceSheet: BalanceSheet): Promise<BalanceSheet> {
    const balanceSheetEntity = convertToBalanceSheetEntity(balanceSheet);
    return convertToBalanceSheet(await repo.save(balanceSheetEntity));
  }

  async function remove(balanceSheet: BalanceSheet): Promise<BalanceSheet> {
    return convertToBalanceSheet(
      await repo.remove(convertToBalanceSheetEntity(balanceSheet))
    );
  }

  function convertToBalanceSheet(
    balanceSheetEntity: BalanceSheetEntity
  ): BalanceSheet {
    const supplyFractions = balanceSheetEntity.companyFacts.supplyFractions.map(
      (s) =>
        makeSupplyFraction({
          countryCode: s.countryCode,
          industryCode: s.industryCode,
          costs: s.costs,
        })
    );

    return makeBalanceSheet({
      id: balanceSheetEntity.id,
      type: balanceSheetEntity.type,
      version: balanceSheetEntity.version,
      companyFacts: makeCompanyFacts({
        ...balanceSheetEntity.companyFacts,
        hasCanteen: balanceSheetEntity.companyFacts.hasCanteen,
        mainOriginOfOtherSuppliers: makeMainOriginOfOtherSuppliers({
          countryCode:
            balanceSheetEntity.companyFacts.mainOriginOfOtherSuppliers
              .countryCode,
          totalPurchaseFromSuppliers:
            balanceSheetEntity.companyFacts.totalPurchaseFromSuppliers,
          supplyFractions,
        }),
        supplyFractions,
        employeesFractions:
          balanceSheetEntity.companyFacts.employeesFractions.map((e) =>
            makeEmployeesFraction({
              countryCode: e.countryCode,
              percentage: e.percentage,
            })
          ),
        industrySectors: balanceSheetEntity.companyFacts.industrySectors.map(
          (i) =>
            makeIndustrySector({
              industryCode: i.industryCode,
              amountOfTotalTurnover: i.amountOfTotalTurnover,
              description: i.description,
            })
        ),
      }),
      ratings: balanceSheetEntity.ratings.map((r) => makeRating({ ...r })),
      stakeholderWeights: balanceSheetEntity.stakeholderWeights,
      organizationId: balanceSheetEntity.organizationEntityId,
    });
  }

  function convertToBalanceSheetEntity(
    balanceSheet: BalanceSheet
  ): BalanceSheetEntity {
    const balanceSheetEntity = new BalanceSheetEntity(
      balanceSheet.id,
      BalanceSheetDBSchema.parse({
        version: balanceSheet.version,
        type: balanceSheet.type,
        companyFacts: {
          ...balanceSheet.companyFacts,
          hasCanteen: balanceSheet.companyFacts.hasCanteen,
          mainOriginOfOtherSuppliers: {
            countryCode:
              balanceSheet.companyFacts.mainOriginOfOtherSuppliers.countryCode,
            costs: balanceSheet.companyFacts.mainOriginOfOtherSuppliers.costs,
          },
          supplyFractions: balanceSheet.companyFacts.supplyFractions.map(
            (s) => ({
              countryCode: s.countryCode,
              industryCode: s.industryCode,
              costs: s.costs,
            })
          ),
          employeesFractions: balanceSheet.companyFacts.employeesFractions.map(
            (e) => ({
              countryCode: e.countryCode,
              percentage: e.percentage,
            })
          ),
          industrySectors: balanceSheet.companyFacts.industrySectors.map(
            (i) => ({
              industryCode: i.industryCode,
              amountOfTotalTurnover: i.amountOfTotalTurnover,
              description: i.description,
            })
          ),
        },
        ratings: balanceSheet.ratings.map((r) => ({ ...r })),
        stakeholderWeights: balanceSheet.stakeholderWeights.map((s) => ({
          ...s,
        })),
      })
    );
    balanceSheetEntity.organizationEntityId = balanceSheet.organizationId;
    return balanceSheetEntity;
  }

  return deepFreeze({
    findByIdOrFail,
    findByOrganization,
    save,
    remove,
  });
}
