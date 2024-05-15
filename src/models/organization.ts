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
  hasMember: (user: User) => boolean;
  rename: (name: string) => Organization;
  updateAddress: (address: OrganizationOpts['address']) => Organization;
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

  function rename(name: string): Organization {
    return makeOrganization({ ...data, name });
  }

  function updateAddress(address: OrganizationOpts['address']): Organization {
    return makeOrganization({ ...data, address });
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
    if (data.members.some((m) => m.id === user.id)) {
      throw new ConflictError();
    }
    if (!data.invitations.includes(user.email)) {
      throw new NoAccessError();
    }

    return makeOrganization({
      ...data,
      members: [
        ...data.members,
        {
          id: user.id,
        },
      ],
      invitations: data.invitations.filter((i) => i !== user.email),
    });
  }

  function hasMember(user: User): boolean {
    return data.members.some((m) => m.id === user.id);
  }

  return deepFreeze({
    ...data,
    withFields,
    invite,
    join,
    hasMember,
    rename,
    updateAddress,
  });
}
