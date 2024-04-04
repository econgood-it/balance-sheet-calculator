import { EntityManager, Repository } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';

export interface IOldOrganizationEntityRepo {
  findByIdOrFail(
    id: number,
    loadBalanceSheetEntities?: boolean
  ): Promise<OrganizationEntity>;
  findOrganizationsOfUser(userEmail: string): Promise<OrganizationEntity[]>;
  findOrganizationsWithInvitation(
    invitationEmail: string
  ): Promise<OrganizationEntity[]>;
  save(organizationEntity: OrganizationEntity): Promise<OrganizationEntity>;
  remove(organizationEntity: OrganizationEntity): Promise<OrganizationEntity>;
}

export class OldOrganizationEntityRepository
  implements IOldOrganizationEntityRepo
{
  private repo: Repository<OrganizationEntity>;
  constructor(manager: EntityManager) {
    this.repo = manager.getRepository(OrganizationEntity);
  }

  findOrganizationsOfUser(userId: string): Promise<OrganizationEntity[]> {
    return this.repo
      .createQueryBuilder('entity')
      .where('entity.members @> :criteria', {
        criteria: JSON.stringify([{ id: userId }]),
      })
      .getMany();
  }

  findOrganizationsWithInvitation(
    invitationEmail: string
  ): Promise<OrganizationEntity[]> {
    return this.repo
      .createQueryBuilder('entity')
      .where('entity.organization @> :criteria', {
        criteria: JSON.stringify({ invitations: [invitationEmail] }),
      })
      .getMany();
  }

  findByIdOrFail(
    id: number,
    loadBalanceSheetEntities: boolean = false
  ): Promise<OrganizationEntity> {
    return this.repo.findOneOrFail({
      where: { id },
      relations: [
        ...(loadBalanceSheetEntities ? ['balanceSheetEntities'] : []),
      ],
    });
  }

  save(organizationEntity: OrganizationEntity): Promise<OrganizationEntity> {
    return this.repo.save(organizationEntity);
  }

  remove(organizationEntity: OrganizationEntity): Promise<OrganizationEntity> {
    return this.repo.remove(organizationEntity);
  }
}
