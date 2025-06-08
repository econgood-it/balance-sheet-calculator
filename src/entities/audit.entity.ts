import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CertificationAuthorityNames } from '@ecogood/e-calculator-schemas/dist/audit.dto';

@Entity()
export class AuditEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column()
  public submittedBalanceSheetId: number;

  @Column()
  public submittedAt: Date;

  @Column()
  public originalCopyId: number;

  @Column()
  public auditCopyId: number;

  @Column({
    type: 'enum',
    enum: CertificationAuthorityNames,
  })
  public certificationAuthority: CertificationAuthorityNames;

  constructor(
    id: number | undefined,
    submittedBalanceSheetId: number,
    originalCopyId: number,
    auditCopyId: number,
    submittedAt: Date,
    certificationAuthority: CertificationAuthorityNames
  ) {
    this.id = id;
    this.submittedBalanceSheetId = submittedBalanceSheetId;
    this.originalCopyId = originalCopyId;
    this.auditCopyId = auditCopyId;
    this.submittedAt = submittedAt;
    this.certificationAuthority = certificationAuthority;
  }
}
