import { CompanyFacts } from "../entities/companyFacts";
import { RegionService } from "../services/region.service";
import { Region } from "../entities/region";


export class StakeholderWeightCalculator {

    private readonly defaultPPPIndex = 0.978035862587365;


    constructor(private companyFacts: CompanyFacts,
        private readonly regionService: RegionService) {
    }

    public async calcStakeholderWeight(stakeholderName: string): Promise<number> {
        try {
            let weight: number = 1;
            switch (stakeholderName) {
                case 'A':
                    weight = await this.calculateSupplierWeightFromCompanyFacts();
                    break;
                case 'B':
                    weight = await this.calculateFinancialWeightFromCompanyFacts();
                    break;
                case 'C':
                    weight = await this.calculateEmployeeWeightFromCompanyFacts();
                    break;
                case 'D':
                    weight = await this.calculateCustomerWeightFromCompanyFacts();
                    break;
                case 'E':
                    weight = await this.calculateSocialEnvironmentlWeightFromCompanyFacts();
                    break;
                default:
                    weight = 1;
                    break;
            }
            return weight;
        } catch (e) {
            return 1;
        }
    }

    // A
    public async calculateSupplierWeightFromCompanyFacts(): Promise<number> {
        const supplierAndEmployeesRiskRation = await this.calculateSupplierAndEmployeesRiskRatio();
        return this.mapToWeight(this.mapToValueBetween60And300(supplierAndEmployeesRiskRation));
    }

    // B
    public async calculateFinancialWeightFromCompanyFacts(): Promise<number> {
        const financialRisk = await this.calculateFinancialRisk();
        return this.mapToWeight(this.mapToValueBetween60And300(financialRisk));
    }

    // C
    public async calculateEmployeeWeightFromCompanyFacts(): Promise<number> {
        const employeesRisk = await this.calculateEmployeesRisk();
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

    public mapToValueBetween60And300(supplierAndEmployeesRiskRatio: number): number {
        return supplierAndEmployeesRiskRatio < 60 ? 60
            : supplierAndEmployeesRiskRatio > 300 ? 300 : supplierAndEmployeesRiskRatio;
    }

    // =WENNFEHLER((60*$'11.Region'.G10/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*10);100)
    public async calculateEmployeesRisk(): Promise<number> {
        const supplierRisks: number = await this.supplyRisks();
        const employeesRisksNormed: number = await this.calculateNormedEmployeesRisk();
        const sumOfFinances: number = this.getSumOfFinancialAspects();
        const numerator = 60 * employeesRisksNormed;
        const denominator: number = supplierRisks + employeesRisksNormed + sumOfFinances;
        return numerator / denominator * 10;
    }

    // =WENNFEHLER((60*(I19+I21+I22+G24)/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*10);100)
    public async calculateFinancialRisk(): Promise<number> {
        const supplierRisks: number = await this.supplyRisks();
        const employeesRisksNormed: number = await this.calculateNormedEmployeesRisk();
        const sumOfFinances: number = this.getSumOfFinancialAspects();
        const numerator = 60 * sumOfFinances;
        const denominator: number = supplierRisks + employeesRisksNormed + sumOfFinances;
        return numerator / denominator * 10;
    }

    public async calculateSupplierAndEmployeesRiskRatio(): Promise<number> {
        // In excel this is equal to the cell $'11.Region'.G3
        const supplierRisks: number = await this.supplyRisks();
        const employeesRisksNormed: number = await this.calculateNormedEmployeesRisk();

        const numerator = 60 * supplierRisks;
        // (60*$'11.Region'.G3/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*5))
        const denominator: number = supplierRisks + employeesRisksNormed + this.getSumOfFinancialAspects();
        return numerator / denominator * 5;
    }

    // In excel this is equal to the cell $'11.Region'.G10
    public async calculateNormedEmployeesRisk(): Promise<number> {
        const employeesRisks: number = await this.employeesRisks();
        const employeesRisksNormalizer: number = this.employeesRisksNormalizer();
        // In excel this is equal to the cell $'11.Region'.G10
        return employeesRisks + employeesRisksNormalizer;
    }

    // In Excel I19+I21+I22+G24
    public getSumOfFinancialAspects(): number {
        return this.companyFacts.profit + this.companyFacts.financialCosts
            + this.companyFacts.incomeFromFinancialInvestments + this.companyFacts.additionsToFixedAssets;
    }

    private employeesRisksNormalizer(): number {
        const sumEmployeesPercentage: number = this.companyFacts.employeesFractions.reduce(
            (sum: number, ef) => sum + ef.percentage, 0)
        return (1 - sumEmployeesPercentage) * 0.978035862587365 * this.companyFacts.totalStaffCosts;
    }

    private async supplyRisks(): Promise<number> {
        let result: number = 0;
        for (const supplyFraction of this.companyFacts.supplyFractions) {
            const region: Region | undefined = await this.regionService.getRegion(supplyFraction.countryCode);
            const pppIndex = region !== undefined ? region.pppIndex : this.defaultPPPIndex;
            result += supplyFraction.costs * pppIndex;
        }
        return result;
    }

    private async employeesRisks(): Promise<number> {
        let result: number = 0;
        for (const employeesFraction of this.companyFacts.employeesFractions) {
            const region: Region | undefined = await this.regionService.getRegion(employeesFraction.countryCode);
            const pppIndex = region !== undefined ? region.pppIndex : this.defaultPPPIndex;
            result += this.companyFacts.totalStaffCosts * employeesFraction.percentage
                * pppIndex;
        }
        return result;
    }

}