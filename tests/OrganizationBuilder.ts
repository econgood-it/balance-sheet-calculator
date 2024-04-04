import { DataSource } from 'typeorm';
import { BalanceSheetEntity } from '../src/entities/balance.sheet.entity';
import { OrganizationEntity } from '../src/entities/organization.entity';
import { OldOrganization } from '../src/models/oldOrganization';
import { User } from '../src/models/user';
import {
  balanceSheetFactory,
  organizationFactory,
} from '../src/openapi/examples';
import { BalanceSheetEntityRepository } from '../src/repositories/old.balance.sheet.entity.repo';
import { OldOrganizationEntityRepository } from '../src/repositories/oldOrganization.entity.repo';
import { UserBuilder } from './UserBuilder';

export type OrganizationBuilderResult = {
  organizationEntity: OrganizationEntity;
};

export class OrganizationBuilder {
  private organization: OldOrganization = organizationFactory.default();
  private members: { id: string }[] = [];
  private balanceSheetEntities: BalanceSheetEntity[] = [];

  public rename(name: string): OrganizationBuilder {
    this.organization.name = name;
    return this;
  }

  public addMember(user?: User): OrganizationBuilder {
    this.members = user
      ? [...this.members, { id: user.id }]
      : [...this.members, { id: new UserBuilder().build().id }];
    return this;
  }

  public inviteMember(email: string): OrganizationBuilder {
    this.organization.invitations = [...this.organization.invitations, email];
    return this;
  }

  public addBalanceSheetEntity(
    balanceSheetEntity?: BalanceSheetEntity
  ): OrganizationBuilder {
    this.balanceSheetEntities = balanceSheetEntity
      ? [...this.balanceSheetEntities, balanceSheetEntity]
      : [
          ...this.balanceSheetEntities,
          new BalanceSheetEntity(
            undefined,
            balanceSheetFactory.emptyFullV508()
          ),
        ];
    return this;
  }

  public async build(
    dataSource: DataSource
  ): Promise<OrganizationBuilderResult> {
    const savedOrganizationEntity = await dataSource.manager.transaction(
      async (entityManager) => {
        const balanceSheetEntityRepository = new BalanceSheetEntityRepository(
          dataSource.manager
        );
        const organizationEntity = new OrganizationEntity(
          undefined,
          this.organization,
          this.members
        );
        for (const balanceSheetEntity of this.balanceSheetEntities) {
          await balanceSheetEntity.reCalculate();
          organizationEntity.addBalanceSheetEntity(
            await balanceSheetEntityRepository.save(balanceSheetEntity)
          );
        }

        return new OldOrganizationEntityRepository(dataSource.manager).save(
          organizationEntity
        );
      }
    );
    return { organizationEntity: savedOrganizationEntity };
  }
}
