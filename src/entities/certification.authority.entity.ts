import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
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

  public constructor(name: string, organizationEntity: OrganizationEntity) {
    this.name = name;
    this.organizationEntity = organizationEntity;
  }
}
