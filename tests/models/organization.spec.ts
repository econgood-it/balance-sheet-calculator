import { OrganizationSchema } from '../../src/models/organization';

describe('Organization', () => {
  const jsonConst = {
    name: 'My organization',
    address: {
      street: 'Example street',
      houseNumber: '28a',
      zip: '999999',
      city: 'Example city',
    },
    invitations: ['user1@example.com', 'user2@example.com'],
  };

  it('parse from json', () => {
    const organization = OrganizationSchema.parse(jsonConst);
    expect(organization).toEqual(jsonConst);
  });
});
