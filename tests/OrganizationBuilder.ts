import { DataSource } from 'typeorm';
import { OrganizationEntity } from '../src/entities/organization.entity';
import { Organization } from '../src/models/organization';
import {
  balanceSheetFactory,
  organizationFactory,
} from '../src/openapi/examples';
import { OrganizationEntityRepository } from '../src/repositories/organization.entity.repo';
import { BalanceSheetEntity } from '../src/entities/balance.sheet.entity';
import { BalanceSheetEntityRepository } from '../src/repositories/balance.sheet.entity.repo';
import { UserBuilder } from './UserBuilder';
import { User } from '../src/models/user';

export type OrganizationBuilderResult = {
  organizationEntity: OrganizationEntity;
};

export class OrganizationBuilder {
  private organization: Organization = organizationFactory.default();
  private members: { id: string }[] = [];
  private balanceSheetEntities: BalanceSheetEntity[] = [];

  public addMember(user?: User): OrganizationBuilder {
    this.members = user
      ? [...this.members, { id: user.email }]
      : [...this.members, { id: new UserBuilder().build().email }];
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
