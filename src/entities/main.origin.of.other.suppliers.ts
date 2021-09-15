import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
import { SupplyFractionDTOCreate } from '../dto/create/supply.fraction.create.dto';
import { SupplyFraction } from './supplyFraction';

@Entity()
export class MainOriginOfOtherSuppliers {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column()
  public countryCode: string;

  @Column('double precision')
  public costs: number;

  constructor(id: number | undefined, countryCode: string, costs: number) {
    this.id = id;
    this.countryCode = countryCode;
    this.costs = costs;
  }
}

export const computeCostsOfMainOriginOfOtherSuppliers = (
  totalPurchaseFromSuppliers: number,
  supplyFractions: SupplyFractionDTOCreate[] | SupplyFraction[]
): number => {
  const costs = supplyFractions.map((sf) => sf.costs);
  return (
    totalPurchaseFromSuppliers -
    costs.reduce(
      (sum: number, currentValue: number) => (sum += currentValue),
      0
    )
  );
};

export const computeCostsAndCreateMainOriginOfOtherSuppliers = (
  countryCode: string,
  totalPurchaseFromSuppliers: number,
  supplyFractions: SupplyFractionDTOCreate[]
): MainOriginOfOtherSuppliers => {
  return new MainOriginOfOtherSuppliers(
    undefined,
    countryCode,
    computeCostsOfMainOriginOfOtherSuppliers(
      totalPurchaseFromSuppliers,
      supplyFractions
    )
  );
};
