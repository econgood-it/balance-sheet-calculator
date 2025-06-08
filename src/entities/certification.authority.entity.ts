import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  RelationId,
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { CertificationAuthorityNames } from '@ecogood/e-calculator-schemas/dist/audit.dto';

@Entity()
export class CertificationAuthorityEntity {
  @PrimaryColumn({
    type: 'enum',
    enum: CertificationAuthorityNames,
  })
  public readonly name: CertificationAuthorityNames;

  @OneToOne(() => OrganizationEntity)
  @JoinColumn()
  public readonly organizationEntity: OrganizationEntity;

  @Column()
  @RelationId(
    (certificationAuthority: CertificationAuthorityEntity) =>
      certificationAuthority.organizationEntity
  )
  public readonly organizationEntityId!: number;

  public constructor(
    name: CertificationAuthorityNames,
    organizationEntity: OrganizationEntity
  ) {
    this.name = name;
    this.organizationEntity = organizationEntity;
  }
}
