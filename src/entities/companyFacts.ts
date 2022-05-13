import { SupplyFraction } from './supplyFraction';
import { EmployeesFraction } from './employeesFraction';
import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { IndustrySector } from './industry.sector';
import { MainOriginOfOtherSuppliers } from './main.origin.of.other.suppliers';

@Entity()
export class CompanyFacts {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column('double precision')
  public totalPurchaseFromSuppliers: number;

  @Column('double precision')
  public totalStaffCosts: number;

  @Column('double precision')
  public profit: number;

  @Column('double precision')
  public financialCosts: number;

  @Column('double precision')
  public incomeFromFinancialInvestments: number;

  @Column('double precision')
  public additionsToFixedAssets: number;

  @Column('double precision')
  public turnover: number;

  @Column('double precision')
  public totalAssets: number;

  @Column('double precision')
  public financialAssetsAndCashBalance: number;

  @Column('double precision')
  public numberOfEmployees: number;

  @Column()
  public hasCanteen: boolean;

  @Column()
  public isB2B: boolean;

  @Column('double precision')
  public averageJourneyToWorkForStaffInKm: number;

  @OneToOne((type) => MainOriginOfOtherSuppliers, { cascade: true })
  @JoinColumn()
  public readonly mainOriginOfOtherSuppliers: MainOriginOfOtherSuppliers;

  @OneToMany(
    (type) => SupplyFraction,
    (supplyFraction) => supplyFraction.companyFacts,
    { cascade: true }
  )
  public supplyFractions: SupplyFraction[];

  @OneToMany(
    (type) => EmployeesFraction,
    (employeesFraction) => employeesFraction.companyFacts,
    { cascade: true }
  )
  public employeesFractions: EmployeesFraction[];

  @OneToMany(
    (type) => IndustrySector,
    (industrySector) => industrySector.companyFacts,
    { cascade: true }
  )
  public industrySectors: IndustrySector[];

  public constructor(
    id: number | undefined,
    totalPurchaseFromSuppliers: number,
    totalStaffCosts: number,
    profit: number,
    financialCosts: number,
    incomeFromFinancialInvestments: number,
    additionsToFixedAssets: number,
    turnover: number,
    totalAssets: number,
    financialAssetsAndCashBalance: number,
    numberOfEmployees: number,
    hasCanteen: boolean,
    averageJourneyToWorkForStaffInKm: number,
    isB2B: boolean,
    supplyFractions: SupplyFraction[],
    employeesFractions: EmployeesFraction[],
    industrySectors: IndustrySector[],
    mainOriginOfOtherSuppliers: MainOriginOfOtherSuppliers
  ) {
    this.id = id;
    this.totalPurchaseFromSuppliers = totalPurchaseFromSuppliers;
    this.totalStaffCosts = totalStaffCosts;
    this.profit = profit;
    this.financialCosts = financialCosts;
    this.incomeFromFinancialInvestments = incomeFromFinancialInvestments;
    this.additionsToFixedAssets = additionsToFixedAssets;
    this.turnover = turnover;
    this.totalAssets = totalAssets;
    this.financialAssetsAndCashBalance = financialAssetsAndCashBalance;
    this.supplyFractions = supplyFractions;
    this.employeesFractions = employeesFractions;
    this.industrySectors = industrySectors;
    this.numberOfEmployees = numberOfEmployees;
    this.hasCanteen = hasCanteen;
    this.isB2B = isB2B;
    this.averageJourneyToWorkForStaffInKm = averageJourneyToWorkForStaffInKm;
    this.mainOriginOfOtherSuppliers = mainOriginOfOtherSuppliers;
  }

  public getAllCountryCodes(removeDuplicates: boolean = false): string[] {
    const allCountryCodes = [
      ...this.supplyFractions.map((s) => s.countryCode),
      ...this.employeesFractions.map((s) => s.countryCode),
      this.mainOriginOfOtherSuppliers.countryCode,
    ];
    return !removeDuplicates ? allCountryCodes : [...new Set(allCountryCodes)];
  }

  /**
   * =IF(AND($'2. Company Facts'.C7=0,$'2. Company Facts'.F10=0,$'2.
   * Company Facts'.F11=0,$'2. Company Facts'.F12=0,$'2.
   * Company Facts'.F13=0,$'2. Company Facts'.F14=0,$'2.
   * Company Facts'.C18=0,$'2. Company Facts'.C19=0,$'2.
   * Company Facts'.C20=0,$'2. Company Facts'.C21=0,$'2.
   * Company Facts'.C22=0,$'2. Company Facts'.C23=0,$'2.
   * Company Facts'.C26=0,$'2. Company Facts'.C27=0,$'2.
   * Company Facts'.D30=0,$'2. Company Facts'.D31=0,$'2.
   * Company Facts'.D32=0,$'2. Company Facts'.C33=0,$'2.
   * Company Facts'.C34=0,$'2. Company Facts'.C37=0,$'2.
   * Company Facts'.C38=0,$'2. Company Facts'.D41=0,$'2.
   * Company Facts'.D42=0,$'2. Company Facts'.D43=0),"empty","data")
   */
  public allValuesAreZero(): boolean {
    if (
      [
        this.totalPurchaseFromSuppliers,
        ...this.supplyFractions.map((sf) => sf.costs),
        this.profit,
        this.financialCosts,
        this.incomeFromFinancialInvestments,
        this.totalAssets,
        this.additionsToFixedAssets,
        this.financialAssetsAndCashBalance,
        this.numberOfEmployees,
        this.totalStaffCosts,
        ...this.employeesFractions.map((ef) => ef.percentage),
        this.averageJourneyToWorkForStaffInKm,
        this.turnover,
        ...this.industrySectors.map((is) => is.amountOfTotalTurnover),
      ].every(
        (value) =>
          value === 0 &&
          [this.isB2B, this.hasCanteen].every((value) => value === false)
      )
    ) {
      return true;
    }
    return false;
  }
}
