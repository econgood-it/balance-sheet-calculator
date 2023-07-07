import { OrganizationEntity } from '../../src/entities/organization.entity';
import { organizationFactory } from '../../src/openapi/examples';
import { User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';

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
      id: id,
      ...organizationFactory.default(),
    });
  });
});
