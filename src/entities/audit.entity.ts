import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuditEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column()
  public submittedBalanceSheetId: number;

  @Column()
  public balanceSheetCopyId: number;

  constructor(
    id: number | undefined,
    submittedBalanceSheetId: number,
    balanceSheetCopyId: number
  ) {
    this.id = id;
    this.submittedBalanceSheetId = submittedBalanceSheetId;
    this.balanceSheetCopyId = balanceSheetCopyId;
  }
}
