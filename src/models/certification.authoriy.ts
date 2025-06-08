import deepFreeze from 'deep-freeze';
import { CertificationAuthorityNames } from '@ecogood/e-calculator-schemas/dist/audit.dto';

export type CertificationAuthority = {
  name: CertificationAuthorityNames;
  organizationId: number;
};

export function makeCertificationAuthority(
  opts: CertificationAuthority
): CertificationAuthority {
  return deepFreeze({ ...opts });
}
