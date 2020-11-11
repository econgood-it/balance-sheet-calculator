import {Region} from "../entities/region";
import {CompanyFacts} from "../entities/companyFacts";
import {Repository} from "typeorm";


export class EmployeesCalc {
  constructor(private readonly regionRepository: Repository<Region>) {
  }

  private async employeesRisks(companyFacts: CompanyFacts): Promise<number> {
    let result: number = 0;
    for (const employeesFraction of companyFacts.employeesFractions) {
      const region: Region = await this.regionRepository.findOneOrFail({countryCode: employeesFraction.countryCode});
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
  public async  calculateNormedEmployeesRisk(companyFacts: CompanyFacts): Promise<number> {
    const employeesRisk = await this.employeesRisks(companyFacts);

    return employeesRisk + this.employeesRisksNormalizer(companyFacts);
  }
}