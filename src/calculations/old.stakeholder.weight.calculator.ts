import { OldCalcResults } from './oldCalculator';
import { OldStakeholderWeightsProvider } from '../providers/oldStakeholderWeightsProvider';

export class OldStakeholderWeightCalculator {
  private readonly defaultPPPIndex = 0.978035862587365;
  private readonly defaultIfDenominatorIsZero = 100.0;

  public async calcStakeholderWeights(
    calcResults: OldCalcResults
  ): Promise<OldStakeholderWeightsProvider> {
    return new OldStakeholderWeightsProvider([
      ['A', await this.calculateSupplierWeightFromCompanyFacts(calcResults)],
      ['B', await this.calculateFinancialWeightFromCompanyFacts(calcResults)],
      ['C', await this.calculateEmployeeWeightFromCompanyFacts(calcResults)],
      ['D', await this.calculateCustomerWeightFromCompanyFacts()],
      ['E', await this.calculateSocialEnvironmentlWeightFromCompanyFacts()],
    ]);
  }

  public async calculateSupplierWeightFromCompanyFacts(
    calcResults: OldCalcResults
  ): Promise<number> {
    const supplierAndEmployeesRiskRation =
      await this.calculateSupplierAndEmployeesRiskRatio(calcResults);
    return this.mapToWeight(
      this.mapToValueBetween60And300(supplierAndEmployeesRiskRation)
    );
  }

  // B
  public async calculateFinancialWeightFromCompanyFacts(
    calcResults: OldCalcResults
  ): Promise<number> {
    const financialRisk = await this.calculateFinancialRisk(calcResults);
    return this.mapToWeight(this.mapToValueBetween60And300(financialRisk));
  }

  // C
  public async calculateEmployeeWeightFromCompanyFacts(
    calcResults: OldCalcResults
  ): Promise<number> {
    const employeesRisk = await this.calculateEmployeesRisk(calcResults);
    return this.mapToWeight(this.mapToValueBetween60And300(employeesRisk));
  }

  // D
  public async calculateCustomerWeightFromCompanyFacts(): Promise<number> {
    return 1.0;
  }

  // E
  public async calculateSocialEnvironmentlWeightFromCompanyFacts(): Promise<number> {
    return 1.0;
  }

  public mapToWeight(normedSupplierAndEmployeesRiskRatio: number) {
    if (normedSupplierAndEmployeesRiskRatio === 60) {
      return 0.5;
    } else if (normedSupplierAndEmployeesRiskRatio === 300) {
      return 2;
    } else if (normedSupplierAndEmployeesRiskRatio < 180) {
      return 1;
    } else {
      return 1.5;
    }
  }

  public mapToValueBetween60And300(
    supplierAndEmployeesRiskRatio: number
  ): number {
    return supplierAndEmployeesRiskRatio < 60
      ? 60
      : supplierAndEmployeesRiskRatio > 300
      ? 300
      : supplierAndEmployeesRiskRatio;
  }

  /**
   * In excel this is equal to the cell $'9.Weighting'.I49
   * =IFERROR((60*$'11.Region'.G3/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*5),100)
   * @param calcResults
   */
  public async calculateSupplierAndEmployeesRiskRatio(
    calcResults: OldCalcResults
  ): Promise<number> {
    // (60*$'11.Region'.G3)
    const numerator = 60 * calcResults.supplyCalcResults.supplyRiskSum;
    // ($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))
    const denominator =
      calcResults.supplyCalcResults.supplyRiskSum +
      calcResults.employeesCalcResults.normedEmployeesRisk +
      calcResults.financeCalcResults.sumOfFinancialAspects;
    // (60*$'11.Region'.G3/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*5))
    return denominator !== 0
      ? (numerator / denominator) * 5
      : this.defaultIfDenominatorIsZero;
  }

  /**
   * In excel this is equal to the cell $'9.Weighting'.I50
   *  =WENNFEHLER((60*(I19+I21+I22+G24)/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*10);100)
   * @param calcResults
   */
  public async calculateFinancialRisk(
    calcResults: OldCalcResults
  ): Promise<number> {
    const numerator = 60 * calcResults.financeCalcResults.sumOfFinancialAspects;
    const denominator: number =
      calcResults.supplyCalcResults.supplyRiskSum +
      calcResults.employeesCalcResults.normedEmployeesRisk +
      calcResults.financeCalcResults.sumOfFinancialAspects;
    return denominator !== 0
      ? (numerator / denominator) * 10
      : this.defaultIfDenominatorIsZero;
  }

  /**
   * In excel this is equal to the cell $'9.Weighting'.I51
   *
   * =WENNFEHLER((60*$'11.Region'.G10/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*10);100)
   * @param calcResults
   */

  public async calculateEmployeesRisk(
    calcResults: OldCalcResults
  ): Promise<number> {
    const numerator = 60 * calcResults.employeesCalcResults.normedEmployeesRisk;
    const denominator: number =
      calcResults.supplyCalcResults.supplyRiskSum +
      calcResults.employeesCalcResults.normedEmployeesRisk +
      calcResults.financeCalcResults.sumOfFinancialAspects;
    return denominator !== 0
      ? (numerator / denominator) * 10
      : this.defaultIfDenominatorIsZero;
  }
}
