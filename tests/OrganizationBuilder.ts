import { DataSource } from 'typeorm';
import { User } from '../src/entities/user';
import { Role } from '../src/entities/enums';
import { v4 as uuid4 } from 'uuid';
import { OrganizationEntity } from '../src/entities/organization.entity';
import { Organization } from '../src/models/organization';
import {
  balanceSheetFactory,
  organizationFactory,
} from '../src/openapi/examples';
import { UserEntityRepository } from '../src/repositories/user.entity.repo';
import { OrganizationEntityRepository } from '../src/repositories/organization.entity.repo';
import { BalanceSheetEntity } from '../src/entities/balance.sheet.entity';
import { BalanceSheetEntityRepository } from '../src/repositories/balance.sheet.entity.repo';

export type OrganizationBuilderResult = {
  organizationEntity: OrganizationEntity;
};

export class OrganizationBuilder {
  private organization: Organization = organizationFactory.default();
  private members: User[] = [];
  private balanceSheetEntities: BalanceSheetEntity[] = [];
  constructor(private dataSource: DataSource) {}

  public addMember(user?: User): OrganizationBuilder {
    this.members = user
      ? [...this.members, user]
      : [
          ...this.members,
          new User(undefined, `${uuid4()}@example.com`, uuid4(), Role.User),
        ];
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
            balanceSheetFactory.emptyFullV508(),
            []
          ),
        ];
    return this;
  }

  public async build(): Promise<OrganizationBuilderResult> {
    const savedOrganizationEntity = await this.dataSource.manager.transaction(
      async (entityManager) => {
        const userRepository = new UserEntityRepository(
          this.dataSource.manager
        );
        const balanceSheetEntityRepository = new BalanceSheetEntityRepository(
          this.dataSource.manager
        );
        for (const member of this.members) {
          await userRepository.save(member);
        }
        const organizationEntity = new OrganizationEntity(
          undefined,
          this.organization,
          this.members
        );
        for (const balanceSheetEntity of this.balanceSheetEntities) {
          organizationEntity.addBalanceSheetEntity(
            await balanceSheetEntityRepository.save(balanceSheetEntity)
          );
        }

        return new OrganizationEntityRepository(this.dataSource.manager).save(
          organizationEntity
        );
      }
    );
    return { organizationEntity: savedOrganizationEntity };
  }
}
