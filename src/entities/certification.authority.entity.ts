import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  RelationId,
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';

export enum CertificationAuthorityNames {
  AUDIT = 'AUDIT',
  PEER_GROUP = 'PEER_GROUP',
}

@Entity()
export class CertificationAuthorityEntity {
  @PrimaryColumn()
  public readonly name: string;

  @OneToOne(() => OrganizationEntity)
  @JoinColumn()
  public readonly organizationEntity: OrganizationEntity;

  @Column()
  @RelationId(
    (certificationAuthority: CertificationAuthorityEntity) =>
      certificationAuthority.organizationEntity
  )
  public readonly organizationEntityId!: number;

  public constructor(name: string, organizationEntity: OrganizationEntity) {
    this.name = name;
    this.organizationEntity = organizationEntity;
  }
}
