import deepFreeze from 'deep-freeze';
import { User } from './user';
import { NoAccessError } from '../exceptions/no.access.error';
import { ConflictError } from '../exceptions/conflict.error';

type OrganizationOpts = {
  id?: number;
  name: string;
  address: {
    city: string;
    houseNumber: string;
    street: string;
    zip: string;
  };
  invitations: readonly string[];
  members: readonly {
    id: string;
  }[];
};

export type Organization = OrganizationOpts & {
  withFields: (fields: Partial<OrganizationOpts>) => Organization;
  invite: (email: string) => Organization;
  join: (user: User) => Organization;
};

export function makeOrganization(opts?: OrganizationOpts): Organization {
  const data = opts || {
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
  };

  function withFields(fields: Partial<OrganizationOpts>): Organization {
    return makeOrganization({ ...data, ...fields });
  }

  function invite(email: string): Organization {
    return data.invitations.includes(email)
      ? makeOrganization(data)
      : makeOrganization({
          ...data,
          invitations: [...data.invitations, email],
        });
  }

  function join(user: User): Organization {
    if (!data.invitations.includes(user.email)) {
      throw new NoAccessError();
    }
    if (data.members.some((m) => m.id === user.id)) {
      throw new ConflictError();
    }
    return makeOrganization({
      ...data,
      members: [
        ...data.members,
        {
          id: user.id,
        },
      ],
    });
  }

  return deepFreeze({
    ...data,
    withFields,
    invite,
    join,
  });
}
