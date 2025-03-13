import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuditEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column()
  public submittedBalanceSheetId: number;

  @Column()
  public originalCopyId: number;

  @Column()
  public auditCopyId: number;

  constructor(
    id: number | undefined,
    submittedBalanceSheetId: number,
    originalCopyId: number,
    auditCopyId: number
  ) {
    this.id = id;
    this.submittedBalanceSheetId = submittedBalanceSheetId;
    this.originalCopyId = originalCopyId;
    this.auditCopyId = auditCopyId;
  }
}
