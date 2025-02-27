import deepFreeze from 'deep-freeze';

export type CertificationAuthority = {
  name: string;
  organizationId: number;
};

export function makeCertificationAuthority(
  opts: CertificationAuthority
): CertificationAuthority {
  return deepFreeze({ ...opts });
}
