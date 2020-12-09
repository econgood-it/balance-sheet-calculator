import {Region} from "../entities/region";
import {CompanyFacts} from "../entities/companyFacts";
import {RegionProvider} from "../providers/region.provider";

export interface EmployeesCalcResults {
  normedEmployeesRisk: number
}

export class EmployeesCalc {
  constructor(private readonly regionProvider: RegionProvider) {
  }

  public calculate(companyFacts: CompanyFacts): EmployeesCalcResults  {
    const normedEmployeesRisk = this.calculateNormedEmployeesRisk(companyFacts);
    return {normedEmployeesRisk: normedEmployeesRisk};
  }

  private employeesRisks(companyFacts: CompanyFacts): number {
    let result: number = 0;
    for (const employeesFraction of companyFacts.employeesFractions) {
      const region: Region = this.regionProvider.getOrFail(employeesFraction.countryCode);
      result += companyFacts.totalStaffCosts * employeesFraction.percentage
        * region.pppIndex;
    }
    return result;
  }

  private employeesRisksNormalizer(companyFacts: CompanyFacts): number {
    const sumEmployeesPercentage: number = companyFacts.employeesFractions.reduce(
      (sum: number, ef) => sum + ef.percentage, 0)
    return (1 - sumEmployeesPercentage) * 0.978035862587365 * companyFacts.totalStaffCosts;
  }

  // In excel this is equal to the cell $'11.Region'.G10
  private calculateNormedEmployeesRisk(companyFacts: CompanyFacts): number {
    const employeesRisk = this.employeesRisks(companyFacts);

    return employeesRisk + this.employeesRisksNormalizer(companyFacts);
  }
}