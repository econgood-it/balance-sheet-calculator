import { EntityManager, Equal } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { makeOrganization, Organization } from '../models/organization';
import deepFreeze from 'deep-freeze';
import { OrganizationDBSchema } from '../entities/schemas/organization.schema';

export interface IOrganizationRepo {
  save(organization: Organization): Promise<Organization>;
  findByIdOrFail(id: number): Promise<Organization>;
  findOrganizationsOfUser(userId: string): Promise<Organization[]>;
  findOrganizationsWithInvitation(email: string): Promise<Organization[]>;
}

export function makeOrganizationRepository(
  manager: EntityManager
): IOrganizationRepo {
  const repo = manager.getRepository(OrganizationEntity);

  async function save(organization: Organization): Promise<Organization> {
    const organizationEntity = convertToOrganizationEntity(organization);
    return convertToOrganization(await repo.save(organizationEntity));
  }

  async function findByIdOrFail(id: number): Promise<Organization> {
    const organizationEntity = await repo.findOneOrFail({
      where: { id: Equal(id) },
      loadRelationIds: true,
    });
    return convertToOrganization(organizationEntity);
  }

  async function findOrganizationsOfUser(
    userId: string
  ): Promise<Organization[]> {
    const organizationEntities = await repo
      .createQueryBuilder('entity')
      .where('entity.members @> :criteria', {
        criteria: JSON.stringify([{ id: userId }]),
      })
      .getMany();
    return organizationEntities.map(convertToOrganization);
  }

  async function findOrganizationsWithInvitation(
    email: string
  ): Promise<Organization[]> {
    const organizationEntities = await repo
      .createQueryBuilder('entity')
      .where('entity.organization @> :criteria', {
        criteria: JSON.stringify({ invitations: [email] }),
      })
      .getMany();
    return organizationEntities.map(convertToOrganization);
  }

  function convertToOrganization(
    organizationEntity: OrganizationEntity
  ): Organization {
    return makeOrganization({
      id: organizationEntity.id,
      name: organizationEntity.organization.name,
      invitations: organizationEntity.organization.invitations,
      address: organizationEntity.organization.address,
      members: organizationEntity.members,
    });
  }

  function convertToOrganizationEntity(
    organization: Organization
  ): OrganizationEntity {
    return new OrganizationEntity(
      organization.id,
      OrganizationDBSchema.parse({
        name: organization.name,
        address: organization.address,
        invitations: [...organization.invitations],
      }),
      [...organization.members]
    );
  }

  return deepFreeze({
    save,
    findByIdOrFail,
    findOrganizationsOfUser,
    findOrganizationsWithInvitation,
  });
}
