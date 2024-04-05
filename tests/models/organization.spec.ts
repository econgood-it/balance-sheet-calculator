import { makeOrganization } from '../../src/models/organization';
import { Role } from '../../src/models/user';
import { NoAccessError } from '../../src/exceptions/no.access.error';
import { ConflictError } from '../../src/exceptions/conflict.error';

describe('Organization', () => {
  it('is created with default values', () => {
    const organization = makeOrganization();
    expect(organization).toMatchObject({
      id: undefined,
      name: 'Test organization',
      address: {
        city: 'Example city',
        houseNumber: '42',
        street: 'Example street',
        zip: '424242',
      },
      invitations: [],
      members: [],
    });
  });
  it('should override fields', () => {
    const organization = makeOrganization();
    const newOrganization = organization.withFields({
      name: 'New name',
      address: {
        city: 'New city',
        houseNumber: '42 new',
        street: 'New street',
        zip: '999999',
      },
      invitations: ['test@example.com'],
      members: [{ id: '1' }],
    });
    expect(newOrganization).toMatchObject({
      id: undefined,
      name: 'New name',
      address: {
        city: 'New city',
        houseNumber: '42 new',
        street: 'New street',
        zip: '999999',
      },
      invitations: ['test@example.com'],
      members: [{ id: '1' }],
    });
  });

  it('should invite a new user', () => {
    const organization = makeOrganization();
    const email = 'test@example.com';
    const newOrganization = organization.invite(email);
    expect(newOrganization.invitations).toEqual([email]);
    expect(newOrganization.invite(email).invitations).toEqual([email]);
  });

  it('should join a new member', () => {
    const organization = makeOrganization();
    const email = 'test@example.com';
    const user = { id: '1', email, role: Role.User };
    const newOrganization = organization.invite(email).join(user);
    expect(newOrganization.members).toEqual([{ id: '1' }]);
  });

  it('should fail to join a new member if invitation is missing', () => {
    const organization = makeOrganization();
    const email = 'test@example.com';
    const user = { id: '1', email, role: Role.User };
    expect(() => organization.join(user)).toThrow(NoAccessError);
  });

  it('should fail to join a new member if member is already in organization', () => {
    const organization = makeOrganization();
    const email = 'test@example.com';
    const user = { id: '1', email, role: Role.User };
    expect(() => organization.invite(email).join(user).join(user)).toThrow(
      ConflictError
    );
  });

  it('should return if user is member of organization', () => {
    const organization = makeOrganization().withFields({
      members: [{ id: '1' }],
    });
    const user = { id: '1', email: 'test@example.com', role: Role.User };
    expect(organization.hasMember(user)).toBe(true);
    expect(organization.hasMember({ ...user, id: '2' })).toBe(false);
  });
});
