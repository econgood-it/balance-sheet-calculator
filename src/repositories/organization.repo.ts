import { EntityManager } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { makeOrganization, Organization } from '../models/organization';
import deepFreeze from 'deep-freeze';

export interface IOrganizationRepo {
  save(organization: Organization): Promise<Organization>;
}

export function makeOrganizationRepository(
  manager: EntityManager
): IOrganizationRepo {
  const repo = manager.getRepository(OrganizationEntity);

  async function save(organization: Organization): Promise<Organization> {
    const organizationEntity = convertToOrganizationEntity(organization);
    return convertToOrganization(await repo.save(organizationEntity));
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
      {
        name: organization.name,
        address: organization.address,
        invitations: [...organization.invitations],
      },
      [...organization.members]
    );
  }

  return deepFreeze({
    save,
  });
}
