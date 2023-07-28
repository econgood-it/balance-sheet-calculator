import { OrganizationEntity } from '../../src/entities/organization.entity';
import {
  balanceSheetFactory,
  organizationFactory,
} from '../../src/openapi/examples';
import { User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';
import { BalanceSheetEntity } from '../../src/entities/balance.sheet.entity';

describe('OrganizationEntity', () => {
  it('should check has member', function () {
    const userEmail = 'test@example.com';
    const organizationEntity = new OrganizationEntity(
      undefined,
      organizationFactory.default(),
      [
        new User(undefined, userEmail, 'pass', Role.User),
        new User(undefined, 'other@example.com', 'pass', Role.User),
      ]
    );
    expect(organizationEntity.hasMemberWithEmail(userEmail)).toBeTruthy();
    expect(
      organizationEntity.hasMemberWithEmail('invalid@example.com')
    ).toBeFalsy();
  });

  it('should return json', function () {
    const userEmail = 'test@example.com';
    const id = 7;
    const organizationEntity = new OrganizationEntity(
      id,
      organizationFactory.default(),
      [
        new User(undefined, userEmail, 'pass', Role.User),
        new User(undefined, 'other@example.com', 'pass', Role.User),
      ]
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
      new BalanceSheetEntity(4, balanceSheetFactory.emptyFullV508(), []),
      new BalanceSheetEntity(7, balanceSheetFactory.emptyFullV508(), []),
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
      balanceSheetFactory.emptyFullV508(),
      []
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
      balanceSheetFactory.emptyFullV508(),
      []
    );
    expect(() =>
      organizationEntity.addBalanceSheetEntity(balanceSheetEntity)
    ).toThrow('Balance sheet has no Id');
  });
});
