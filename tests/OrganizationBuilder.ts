import { DataSource } from 'typeorm';
import { BalanceSheetEntity } from '../src/entities/balance.sheet.entity';
import { OrganizationEntity } from '../src/entities/organization.entity';
import { Organization } from '../src/models/organization';
import { User } from '../src/models/user';
import {
  balanceSheetFactory,
  organizationFactory,
} from '../src/openapi/examples';
import { BalanceSheetEntityRepository } from '../src/repositories/balance.sheet.entity.repo';
import { OrganizationEntityRepository } from '../src/repositories/organization.entity.repo';
import { UserBuilder } from './UserBuilder';

export type OrganizationBuilderResult = {
  organizationEntity: OrganizationEntity;
};

export class OrganizationBuilder {
  private organization: Organization = organizationFactory.default();
  private members: { id: string }[] = [];
  private balanceSheetEntities: BalanceSheetEntity[] = [];

  public addMember(user?: User): OrganizationBuilder {
    this.members = user
      ? [...this.members, { id: user.id }]
      : [...this.members, { id: new UserBuilder().build().id }];
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

        return new OrganizationEntityRepository(dataSource.manager).save(
          organizationEntity
        );
      }
    );
    return { organizationEntity: savedOrganizationEntity };
  }
}
