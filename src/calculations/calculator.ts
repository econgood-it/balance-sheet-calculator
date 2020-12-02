import {CompanyFacts} from "../entities/companyFacts";
import {Repository} from "typeorm";
import {Region} from "../entities/region";
import {SupplierCalc, SupplyCalcResults} from "./supplier.calc";
import {EmployeesCalc} from "./employees.calc";
import {FinanceCalc, FinanceCalcResults} from "./finance.calc";
import {Industry} from "../entities/industry";

export interface CalcResults {
  supplyRiskSum: number,
  supplyChainWeight: number,
  itucAverage: number,
  normedEmployeesRisk: number,
  sumOfFinancialAspects: number,
  economicRatio: number
}

export class Calculator {
  public readonly supplierCalc: SupplierCalc;
  public readonly employeesCalc: EmployeesCalc;
  public readonly financeCalc: FinanceCalc;

  constructor(private readonly regionRepository: Repository<Region>,
              private readonly industryRepository: Repository<Industry>) {
    this.supplierCalc = new SupplierCalc(this.regionRepository, this.industryRepository);
    this.employeesCalc = new EmployeesCalc(this.regionRepository);
    this.financeCalc = new FinanceCalc();
  }

  public async calculate(companyFacts: CompanyFacts): Promise<CalcResults> {
    const supplyCalcResults: SupplyCalcResults = await this.supplierCalc.calculate(companyFacts);
    const financeCalcResults: FinanceCalcResults = this.financeCalc.calculate(companyFacts);
    return {
      supplyRiskSum: supplyCalcResults.supplyRiskSum,
      supplyChainWeight: supplyCalcResults.supplyChainWeight,
      itucAverage: supplyCalcResults.itucAverage,
      normedEmployeesRisk: await this.employeesCalc.calculateNormedEmployeesRisk(companyFacts),
      sumOfFinancialAspects: financeCalcResults.sumOfFinancialAspects,
      economicRatio: financeCalcResults.economicRatio,
    }
  }

}