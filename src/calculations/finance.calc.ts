import {Repository} from "typeorm";
import {Region} from "../entities/region";
import {CompanyFacts} from "../entities/companyFacts";

export class FinanceCalc {
  constructor(private readonly regionRepository: Repository<Region>) {
  }

  // In Excel I19+I21+I22+G24
  public getSumOfFinancialAspects(companyFacts: CompanyFacts): number {
    return companyFacts.profit + companyFacts.financialCosts
      + companyFacts.incomeFromFinancialInvestments + companyFacts.additionsToFixedAssets;
  }

  // public calculateEconomicRatio(companyFacts: CompanyFacts): number {
  //   return companyFacts
  // }
}