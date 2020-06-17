import { StakeholderWeightCalculator } from "../../src/calculations/StakeholderWeightCalculator";
import { CompanyFacts } from "../../src/entities/companyFacts";
import { SupplyFraction } from "../../src/entities/supplyFraction";
import { EmployeesFraction } from "../../src/entities/employeesFraction";

describe('Stakeholder Weight Calculator', () => {

    let companyFacts: CompanyFacts;


    beforeAll(() => {
        const arabEmiratesCode = "ARE";
        const afghanistanCode = "AFG";
        const supplyFractions: SupplyFraction[] = [new SupplyFraction(arabEmiratesCode, 300), new SupplyFraction(afghanistanCode, 20)];
        const employeesFractions: EmployeesFraction[] = [new EmployeesFraction(arabEmiratesCode, 0.3), new EmployeesFraction(afghanistanCode, 1)];
        companyFacts = new CompanyFacts(0, 2345, 238, 473, 342, 234, supplyFractions, employeesFractions);
    });

    it('should calculate supplier and employees risk ratio', () => {
        const stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts);
        const result = stakeholderWeightCalculator.calculateSupplierAndEmployeesRiskRatio();
        expect(result).toBeCloseTo(17.8789386768471, 13);
    })

    it('should calculate employees risk', () => {
        const stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts);
        const result = stakeholderWeightCalculator.calculateEmployeesRisk();
        expect(result).toBeCloseTo(497.59989178182354, 13);

    })

    it('should calculate financial risk', () => {
        const stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts);
        const result = stakeholderWeightCalculator.calculateFinancialRisk();
        expect(result).toBeCloseTo(66.6422308644823, 13);
    })

    it('should map to value between 60 and 300', () => {
        const stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts);
        expect(stakeholderWeightCalculator.mapToValueBetween60And300(59.999)).toBeCloseTo(
            60, 1);
        expect(stakeholderWeightCalculator.mapToValueBetween60And300(300.1)).toBeCloseTo(
            300, 1);
        expect(stakeholderWeightCalculator.mapToValueBetween60And300(60.4)).toBeCloseTo(
            60.4, 1);
        expect(stakeholderWeightCalculator.mapToValueBetween60And300(299.999)).toBeCloseTo(
            299.999, 3);
    })

    it('should calculate stakeholder weights', () => {
        const stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts);
        let result: number = stakeholderWeightCalculator.calcStakeholderWeight('A');
        expect(result).toBeCloseTo(0.5, 3);
        result = stakeholderWeightCalculator.calcStakeholderWeight('B');
        expect(result).toBeCloseTo(1, 2);
        result = stakeholderWeightCalculator.calcStakeholderWeight('C');
        expect(result).toBeCloseTo(2, 2);
        result = stakeholderWeightCalculator.calcStakeholderWeight('D');
        expect(result).toBeCloseTo(1, 2);
        result = stakeholderWeightCalculator.calcStakeholderWeight('E');
        expect(result).toBeCloseTo(1, 2);
    })


})