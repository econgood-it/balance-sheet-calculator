import {
  ORGANIZATION_RELATIONS,
  OrganizationEntity,
} from '../entities/organization.entity';
import { EntityManager, Repository } from 'typeorm';

export interface IOrganizationEntityRepo {
  findByIdOrFail(id: number): Promise<OrganizationEntity>;
  findOrganizationsOfUser(userId: number): Promise<OrganizationEntity[]>;
  save(organizationEntity: OrganizationEntity): Promise<OrganizationEntity>;
  remove(organizationEntity: OrganizationEntity): Promise<OrganizationEntity>;
}

export class OrganizationEntityRepository implements IOrganizationEntityRepo {
  private repo: Repository<OrganizationEntity>;
  constructor(manager: EntityManager) {
    this.repo = manager.getRepository(OrganizationEntity);
  }

  findOrganizationsOfUser(userId: number): Promise<OrganizationEntity[]> {
    return this.repo.find({
      where: {
        members: {
          id: userId,
        },
      },
      relations: ORGANIZATION_RELATIONS,
    });
  }

  findByIdOrFail(id: number): Promise<OrganizationEntity> {
    return this.repo.findOneOrFail({
      where: { id },
      relations: ORGANIZATION_RELATIONS,
    });
  }

  save(organizationEntity: OrganizationEntity): Promise<OrganizationEntity> {
    return this.repo.save(organizationEntity);
  }

  remove(organizationEntity: OrganizationEntity): Promise<OrganizationEntity> {
    return this.repo.remove(organizationEntity);
  }
}
