import {
  ORGANIZATION_RELATIONS,
  OrganizationEntity,
} from '../entities/organization.entity';
import { EntityManager, Repository } from 'typeorm';

export interface IOrganizationEntityRepo {
  findByIdOrFail(id: number): Promise<OrganizationEntity>;
  save(organizationEntity: OrganizationEntity): Promise<OrganizationEntity>;
}

export class OrganizationEntityRepository implements IOrganizationEntityRepo {
  private repo: Repository<OrganizationEntity>;
  constructor(manager: EntityManager) {
    this.repo = manager.getRepository(OrganizationEntity);
  }

  findByIdOrFail(id: number): Promise<OrganizationEntity> {
    return this.repo.findOneOrFail({
      where: { id: id },
      relations: ORGANIZATION_RELATIONS,
    });
  }

  save(organizationEntity: OrganizationEntity): Promise<OrganizationEntity> {
    return this.repo.save(organizationEntity);
  }
}
