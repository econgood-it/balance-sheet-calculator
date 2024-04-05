import {
  OrganizationDBSchema,
  OrganizationEntity,
} from '../../src/entities/organization.entity';
import {
  balanceSheetFactory,
  organizationFactory,
} from '../../src/openapi/examples';

import {
  BalanceSheetDBSchema,
  BalanceSheetEntity,
} from '../../src/entities/balance.sheet.entity';
import { UserBuilder } from '../UserBuilder';
import { v4 as uuid4 } from 'uuid';
import { NoAccessError } from '../../src/exceptions/no.access.error';
import { ConflictError } from '../../src/exceptions/conflict.error';

describe('OrganizationEntity', () => {
  it('should check has member', function () {
    const userBuilder = new UserBuilder();
    const member1 = userBuilder.build();
    const organizationEntity = new OrganizationEntity(
      undefined,
      OrganizationDBSchema.parse(organizationFactory.default()),
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
      OrganizationDBSchema.parse(organizationFactory.default()),
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
      OrganizationDBSchema.parse(organizationFactory.default()),
      []
    );

    expect(organizationEntity.balanceSheetEntities).toBeUndefined();
    const balanceSheetEntities = [
      new BalanceSheetEntity(
        4,
        BalanceSheetDBSchema.parse(balanceSheetFactory.emptyFullV508())
      ),
      new BalanceSheetEntity(
        7,
        BalanceSheetDBSchema.parse(balanceSheetFactory.emptyFullV508())
      ),
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
      OrganizationDBSchema.parse(organizationFactory.default()),
      []
    );
    const balanceSheetEntity = new BalanceSheetEntity(
      4,
      BalanceSheetDBSchema.parse(balanceSheetFactory.emptyFullV508())
    );
    organizationEntity.addBalanceSheetEntity(balanceSheetEntity);
    expect(() =>
      organizationEntity.addBalanceSheetEntity(balanceSheetEntity)
    ).toThrow('Balance sheet already exists in organization');
  });
  it('should fail with if balanceSheetEntity without id is added', function () {
    const organizationEntity = new OrganizationEntity(
      undefined,
      OrganizationDBSchema.parse(organizationFactory.default()),
      []
    );
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      BalanceSheetDBSchema.parse(balanceSheetFactory.emptyFullV508())
    );
    expect(() =>
      organizationEntity.addBalanceSheetEntity(balanceSheetEntity)
    ).toThrow('Balance sheet has no Id');
  });

  it('should invite user via email', function () {
    const organizationEntity = new OrganizationEntity(
      undefined,
      OrganizationDBSchema.parse(organizationFactory.default()),
      []
    );
    const email = `${uuid4()}@example.com`;
    organizationEntity.invite(email);
    const email2 = `${uuid4()}@example.com`;
    organizationEntity.invite(email2);
    organizationEntity.invite(email);

    expect(organizationEntity.organization.invitations).toEqual([
      email,
      email2,
    ]);
  });

  it('user can join organization', async () => {
    const user = new UserBuilder().build();
    const members = [{ id: uuid4() }];
    const anotherEmail = `${uuid4()}@example.com`;
    const organizationEntity = new OrganizationEntity(
      undefined,
      OrganizationDBSchema.parse({
        ...organizationFactory.default(),
        invitations: [user.email, anotherEmail],
      }),
      [...members]
    );
    organizationEntity.join(user);
    const expectedMembers = [...members, { id: user.id }];
    expect(organizationEntity.members).toEqual(expectedMembers);
    expect(organizationEntity.organization.invitations).toEqual([anotherEmail]);
  });

  it('throw conflict if user is already member', async () => {
    const user = new UserBuilder().build();
    const organizationEntity = new OrganizationEntity(
      undefined,
      OrganizationDBSchema.parse({
        ...organizationFactory.default(),
        invitations: [user.email],
      }),
      [{ id: user.id }]
    );
    expect(() => organizationEntity.join(user)).toThrow(ConflictError);
  });

  it('user without invitation cannot join', async () => {
    const organizationEntity = new OrganizationEntity(
      undefined,
      OrganizationDBSchema.parse(organizationFactory.default()),
      []
    );
    const user = new UserBuilder().build();
    expect(() => organizationEntity.join(user)).toThrow(NoAccessError);
  });
});
