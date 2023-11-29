import { OrganizationEntity } from '../../src/entities/organization.entity';
import {
  balanceSheetFactory,
  organizationFactory,
} from '../../src/openapi/examples';

import { BalanceSheetEntity } from '../../src/entities/balance.sheet.entity';
import { UserBuilder } from '../UserBuilder';

describe('OrganizationEntity', () => {
  it('should check has member', function () {
    const userBuilder = new UserBuilder();
    const member1 = userBuilder.build();
    const organizationEntity = new OrganizationEntity(
      undefined,
      organizationFactory.default(),
      [{ id: member1.email }, { id: userBuilder.build().email }]
    );
    expect(organizationEntity.hasMember({ id: member1.email })).toBeTruthy();
    expect(
      organizationEntity.hasMember({ id: 'invalid@example.com' })
    ).toBeFalsy();
  });

  it('should return json', function () {
    const userBuilder = new UserBuilder();
    const id = 7;
    const organizationEntity = new OrganizationEntity(
      id,
      organizationFactory.default(),
      [{ id: userBuilder.build().email }, { id: userBuilder.build().email }]
    );
    expect(organizationEntity.toJson()).toEqual({
      id,
      ...organizationFactory.default(),
    });
  });

  it('should add balanceSheetEntities', function () {
    const organizationEntity = new OrganizationEntity(
      undefined,
      organizationFactory.default(),
      []
    );

    expect(organizationEntity.balanceSheetEntities).toBeUndefined();
    const balanceSheetEntities = [
      new BalanceSheetEntity(4, balanceSheetFactory.emptyFullV508()),
      new BalanceSheetEntity(7, balanceSheetFactory.emptyFullV508()),
    ];
    balanceSheetEntities.forEach((b) =>
      organizationEntity.addBalanceSheetEntity(b)
    );
    expect(
      organizationEntity.balanceSheetEntities?.map((b) => b.toJson('en'))
    ).toEqual(balanceSheetEntities.map((b) => b.toJson('en')));
  });

  it('should fail with conflict if balanceSheetEntity is added twice', function () {
    const organizationEntity = new OrganizationEntity(
      undefined,
      organizationFactory.default(),
      []
    );
    const balanceSheetEntity = new BalanceSheetEntity(
      4,
      balanceSheetFactory.emptyFullV508()
    );
    organizationEntity.addBalanceSheetEntity(balanceSheetEntity);
    expect(() =>
      organizationEntity.addBalanceSheetEntity(balanceSheetEntity)
    ).toThrow('Balance sheet already exists in organization');
  });
  it('should fail with if balanceSheetEntity without id is added', function () {
    const organizationEntity = new OrganizationEntity(
      undefined,
      organizationFactory.default(),
      []
    );
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      balanceSheetFactory.emptyFullV508()
    );
    expect(() =>
      organizationEntity.addBalanceSheetEntity(balanceSheetEntity)
    ).toThrow('Balance sheet has no Id');
  });
});
