import { RegionProvider } from '../providers/region.provider';
import { Region } from '../models/region';
import { CompanyFacts } from '../models/company.facts';
import { SupplierCalc } from './supplier.calc';

export enum CompanySize {
  micro = 'micro',
  small = 'small',
  middle = 'middle',
  large = 'large',
}

export interface EmployeesCalcResults {
  normedEmployeesRisk: number;
  companySize: CompanySize;
  itucAverage: number;
}

export class EmployeesCalc {
  private static readonly DEFAULT_PPP_INDEX = 1.00304566871495;
  private static readonly DEFAULT_ITUC_AVERAGE = 0;

  constructor(private readonly regionProvider: RegionProvider) {}

  public calculate(companyFacts: CompanyFacts): EmployeesCalcResults {
    const normedEmployeesRisk = this.calculateNormedEmployeesRisk(companyFacts);
    const companySize = this.calculateCompanySize(companyFacts);
    const itucAverage = this.calculateItucAverage(companyFacts);
    return {
      normedEmployeesRisk,
      companySize,
      itucAverage,
    };
  }

  /***
   * In excel this is equal to the cells $'11.Region'.F10 - F12
   * @param companyFacts
   * @private
   */
  private employeesRisks(companyFacts: CompanyFacts): number {
    let result: number = 0;
    for (const employeesFraction of companyFacts.employeesFractions) {
      const pppIndex = employeesFraction.countryCode
        ? this.regionProvider.getOrFail(employeesFraction.countryCode).pppIndex
        : EmployeesCalc.DEFAULT_PPP_INDEX;
      result +=
        companyFacts.totalStaffCosts * employeesFraction.percentage * pppIndex;
    }
    return result;
  }

  /***
   * In excel this is equal to the cells $'11.Region'.F13
   * @param companyFacts
   * @private
   */
  private employeesRisksNormalizer(companyFacts: CompanyFacts): number {
    const sumEmployeesPercentage: number =
      companyFacts.employeesFractions.reduce(
        (sum: number, ef) => sum + ef.percentage,
        0
      );

    return (
      (1 - sumEmployeesPercentage) *
      //0.978035862587365 *
      EmployeesCalc.DEFAULT_PPP_INDEX *
      companyFacts.totalStaffCosts
    );
  }

  // In excel this is equal to the cell $'11.Region'.G10
  private calculateNormedEmployeesRisk(companyFacts: CompanyFacts): number {
    const employeesRisk = this.employeesRisks(companyFacts);

    return employeesRisk + this.employeesRisksNormalizer(companyFacts);
  }

  private calculateItucAverage(companyFacts: CompanyFacts): number {
    let result = 0;
    for (const employeesFraction of companyFacts.employeesFractions) {
      result += employeesFraction.countryCode
        ? employeesFraction.percentage *
          this.regionProvider.getOrFail(employeesFraction.countryCode).ituc
        : EmployeesCalc.DEFAULT_ITUC_AVERAGE;
    }
    return result;
  }

  private calculateCompanySize(companyFacts: CompanyFacts): CompanySize {
    const mio = 1000000;
    const mio2 = 2 * mio;
    const mio10 = 10 * mio;
    if (
      companyFacts.numberOfEmployees < 10 &&
      (companyFacts.turnover <= mio2 || companyFacts.totalAssets <= mio2)
    ) {
      return CompanySize.micro;
    } else if (
      companyFacts.numberOfEmployees < 50 &&
      (companyFacts.turnover <= mio10 || companyFacts.totalAssets <= mio10)
    ) {
      return CompanySize.small;
    } else if (
      companyFacts.numberOfEmployees < 250 &&
      (companyFacts.turnover <= 50 * mio ||
        companyFacts.totalAssets <= 43 * mio)
    ) {
      return CompanySize.middle;
    } else {
      return CompanySize.large;
    }
  }
}
