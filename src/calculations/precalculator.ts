import {CompanyFacts} from "../entities/companyFacts";
import {Repository} from "typeorm";
import {Region} from "../entities/region";
import {SupplierCalc} from "./supplier.calc";
import {EmployeesCalc} from "./employees.calc";
import {FinanceCalc} from "./finance.calc";

export interface Precalculations {
  supplyRisks: number,
  normedEmployeesRisk: number,
  sumOfFinancialAspects: number
}

export class Precalculator {
  public readonly supplierCalc: SupplierCalc;
  public readonly employeesCalc: EmployeesCalc;
  public readonly financeCalc: FinanceCalc;

  constructor(private readonly regionRepository: Repository<Region>) {
    this.supplierCalc = new SupplierCalc(this.regionRepository);
    this.employeesCalc = new EmployeesCalc(this.regionRepository);
    this.financeCalc = new FinanceCalc(this.regionRepository);
  }

  public async calculate(companyFacts: CompanyFacts): Promise<Precalculations> {
    return {
      supplyRisks: await this.supplierCalc.supplyRisks(companyFacts),
      normedEmployeesRisk: await this.employeesCalc.calculateNormedEmployeesRisk(companyFacts),
      sumOfFinancialAspects: await this.financeCalc.getSumOfFinancialAspects(companyFacts)
    }
  }

}