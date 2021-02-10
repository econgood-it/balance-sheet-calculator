import {Region} from "../entities/region";
import {CompanyFacts} from "../entities/companyFacts";
import {RegionProvider} from "../providers/region.provider";

export enum CompanySize {
  micro = 'micro',
  small = 'small',
  middle = 'middle',
  large = 'large'
}

export interface EmployeesCalcResults {
  normedEmployeesRisk: number,
  companySize: CompanySize,
  itucAverage: number,
}

export class EmployeesCalc {
  constructor(private readonly regionProvider: RegionProvider) {
  }

  public calculate(companyFacts: CompanyFacts): EmployeesCalcResults  {
    const normedEmployeesRisk = this.calculateNormedEmployeesRisk(companyFacts);
    const companySize = this.calculateCompanySize(companyFacts);
    const itucAverage = this.calculateItucAverage(companyFacts);
    return {normedEmployeesRisk: normedEmployeesRisk, companySize: companySize, itucAverage: itucAverage};
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

  private calculateItucAverage(companyFacts: CompanyFacts): number {
    let result = 0;
    for (const employeesFraction of companyFacts.employeesFractions) {
      result += employeesFraction.percentage * this.regionProvider.getOrFail(employeesFraction.countryCode).ituc;
    }
    return result;
  }

  private calculateCompanySize(companyFacts: CompanyFacts): CompanySize {
    const mio = 1000000;
    const mio2 = 2*mio;
    const mio10 = 10*mio;
    if (companyFacts.numberOfEmployees < 10 &&
      (companyFacts.turnover <= mio2 || companyFacts.totalAssets <= mio2)) {
      return CompanySize.micro;
    } else if (companyFacts.numberOfEmployees < 50 &&
      (companyFacts.turnover <= mio10 || companyFacts.totalAssets <= mio10)) {
      return CompanySize.small;
    } else if (companyFacts.numberOfEmployees < 250 &&
      (companyFacts.turnover <= 50*mio || companyFacts.totalAssets <= 43*mio)) {
      return CompanySize.middle;
    } else {
      return CompanySize.large;
    }
  }
}