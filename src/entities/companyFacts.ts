import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { SupplyFraction } from './supplyFraction';
import { EmployeesFraction } from './employeesFraction';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import {IndustrySector} from "./industry.sector";

@Entity()
export class CompanyFacts {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;
  @Column("double precision")
  public totalPurchaseFromSuppliers: number;
  @Column("double precision")
  public totalStaffCosts: number;
  @Column("double precision")
  public profit: number;
  @Column("double precision")
  public financialCosts: number;
  @Column("double precision")
  public incomeFromFinancialInvestments: number;
  @Column("double precision")
  public additionsToFixedAssets: number;
  @OneToMany(type => SupplyFraction, supplyFraction => supplyFraction.companyFacts, { cascade: true })
  public supplyFractions: SupplyFraction[];
  @OneToMany(type => EmployeesFraction, employeesFraction => employeesFraction.companyFacts, { cascade: true })
  public employeesFractions: EmployeesFraction[];
  @OneToMany(type => IndustrySector, industrySector => industrySector.companyFacts, { cascade: true })
  public industrySectors: IndustrySector[];

  public constructor(
    id: number | undefined,
    totalPurchaseFromSuppliers: number,
    totalStaffCosts: number,
    profit: number,
    financialCosts: number,
    incomeFromFinancialInvestments: number,
    additionsToFixedAssets: number,
    supplyFractions: SupplyFraction[],
    employeesFractions: EmployeesFraction[],
    industrySectors: IndustrySector[]
  ) {
    this.id = id;
    this.totalPurchaseFromSuppliers = totalPurchaseFromSuppliers;
    this.totalStaffCosts = totalStaffCosts;
    this.profit = profit;
    this.financialCosts = financialCosts;
    this.incomeFromFinancialInvestments = incomeFromFinancialInvestments;
    this.additionsToFixedAssets = additionsToFixedAssets;
    this.supplyFractions = supplyFractions;
    this.employeesFractions = employeesFractions;
    this.industrySectors = industrySectors;
  }

}
