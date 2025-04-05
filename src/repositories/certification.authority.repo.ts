import { EntityManager } from 'typeorm';
import deepFreeze from 'deep-freeze';
import { CertificationAuthorityEntity } from '../entities/certification.authority.entity';
import {
  CertificationAuthority,
  makeCertificationAuthority,
} from '../models/certification.authoriy';
import { CertificationAuthorityNames } from '@ecogood/e-calculator-schemas/dist/audit.dto';

export interface ICertificationAuthorityRepo {
  findByName(
    name: CertificationAuthorityNames
  ): Promise<CertificationAuthority>;
}

export function makeCertificationAuthorityRepo(
  manager: EntityManager
): ICertificationAuthorityRepo {
  const repo = manager.getRepository(CertificationAuthorityEntity);

  async function findByName(
    name: CertificationAuthorityNames
  ): Promise<CertificationAuthority> {
    return convertToCertificationAuthority(
      await repo.findOneOrFail({
        where: { name },
      })
    );
  }

  async function convertToCertificationAuthority(
    certificationAuthorityEntity: CertificationAuthorityEntity
  ): Promise<CertificationAuthority> {
    return makeCertificationAuthority({
      name: certificationAuthorityEntity.name,
      organizationId: certificationAuthorityEntity.organizationEntityId,
    });
  }

  return deepFreeze({
    findByName,
  });
}
