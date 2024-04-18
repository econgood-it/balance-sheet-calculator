import { CalcResults } from './calculator';
import deepFreeze from 'deep-freeze';
import {
  makeStakeholderWeight,
  StakeholderWeight,
} from '../models/stakeholder.weight';
import {
  makeStakeholderWeightsProvider,
  StakeholderWeightsProvider,
} from '../providers/stakeholder.weights.provider';

export function makeStakeholderWeightCalculator(calcResults: CalcResults) {
  const defaultIfDenominatorIsZero = 100.0;

  async function calculate(): Promise<StakeholderWeightsProvider> {
    return makeStakeholderWeightsProvider([
      await calculateSupplierWeightFromCompanyFacts(),
      await calculateFinancialWeightFromCompanyFacts(),
      await calculateEmployeeWeightFromCompanyFacts(),
      await calculateCustomerWeightFromCompanyFacts(),
      await calculateSocialEnvironmentlWeightFromCompanyFacts(),
    ]);
  }

  async function calculateSupplierWeightFromCompanyFacts(): Promise<StakeholderWeight> {
    const supplierAndEmployeesRiskRation =
      await calculateSupplierAndEmployeesRiskRatio();
    return makeStakeholderWeight({
      shortName: 'A',
      weight: mapToWeight(
        mapToValueBetween60And300(supplierAndEmployeesRiskRation)
      ),
    });
  }

  // B
  async function calculateFinancialWeightFromCompanyFacts(): Promise<StakeholderWeight> {
    const financialRisk = await calculateFinancialRisk();
    return makeStakeholderWeight({
      shortName: 'B',
      weight: mapToWeight(mapToValueBetween60And300(financialRisk)),
    });
  }

  // C
  async function calculateEmployeeWeightFromCompanyFacts(): Promise<StakeholderWeight> {
    const employeesRisk = await calculateEmployeesRisk();
    return makeStakeholderWeight({
      shortName: 'C',
      weight: mapToWeight(mapToValueBetween60And300(employeesRisk)),
    });
  }

  // D
  async function calculateCustomerWeightFromCompanyFacts(): Promise<StakeholderWeight> {
    return makeStakeholderWeight({
      shortName: 'D',
      weight: 1.0,
    });
  }

  // E
  async function calculateSocialEnvironmentlWeightFromCompanyFacts(): Promise<StakeholderWeight> {
    return makeStakeholderWeight({
      shortName: 'E',
      weight: 1.0,
    });
  }

  function mapToWeight(normedSupplierAndEmployeesRiskRatio: number) {
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

  function mapToValueBetween60And300(
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
  async function calculateSupplierAndEmployeesRiskRatio(): Promise<number> {
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
      : defaultIfDenominatorIsZero;
  }

  /**
   * In excel this is equal to the cell $'9.Weighting'.I50
   *  =WENNFEHLER((60*(I19+I21+I22+G24)/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*10);100)
   * @param calcResults
   */
  async function calculateFinancialRisk(): Promise<number> {
    const numerator = 60 * calcResults.financeCalcResults.sumOfFinancialAspects;
    const denominator: number =
      calcResults.supplyCalcResults.supplyRiskSum +
      calcResults.employeesCalcResults.normedEmployeesRisk +
      calcResults.financeCalcResults.sumOfFinancialAspects;
    return denominator !== 0
      ? (numerator / denominator) * 10
      : defaultIfDenominatorIsZero;
  }

  /**
   * In excel this is equal to the cell $'9.Weighting'.I51
   *
   * =WENNFEHLER((60*$'11.Region'.G10/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*10);100)
   * @param calcResults
   */

  async function calculateEmployeesRisk(): Promise<number> {
    const numerator = 60 * calcResults.employeesCalcResults.normedEmployeesRisk;
    const denominator: number =
      calcResults.supplyCalcResults.supplyRiskSum +
      calcResults.employeesCalcResults.normedEmployeesRisk +
      calcResults.financeCalcResults.sumOfFinancialAspects;
    return denominator !== 0
      ? (numerator / denominator) * 10
      : defaultIfDenominatorIsZero;
  }

  return deepFreeze({
    calculate,
    calculateSupplierWeightFromCompanyFacts,
    calculateSupplierAndEmployeesRiskRatio,
    calculateEmployeesRisk,
    calculateFinancialRisk,
    mapToValueBetween60And300,
  });
}
