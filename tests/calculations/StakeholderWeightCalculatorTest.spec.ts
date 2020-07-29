import { StakeholderWeightCalculator } from "../../src/calculations/StakeholderWeightCalculator";
import { CompanyFacts } from "../../src/entities/companyFacts";
import { SupplyFraction } from "../../src/entities/supplyFraction";
import { EmployeesFraction } from "../../src/entities/employeesFraction";
import { DatabaseConnectionCreator } from '../../src/DatabaseConnectionCreator';
import { Connection, Repository } from "typeorm";
import RegionService from "../../src/services/region.service";
import { Region } from "../../src/entities/region";


describe('Stakeholder Weight Calculator', () => {

    let companyFacts: CompanyFacts;
    let connection: Connection;
    let regionService: RegionService;
    const arabEmiratesCode = "ARE";
    const afghanistanCode = "AFG";

    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations();
        const regionRepository = connection.getRepository(Region)
        regionService = new RegionService(regionRepository);
        const supplyFractions: SupplyFraction[] = [new SupplyFraction(undefined, arabEmiratesCode, 300), new SupplyFraction(undefined, afghanistanCode, 20)];
        const employeesFractions: EmployeesFraction[] = [new EmployeesFraction(undefined, arabEmiratesCode, 0.3), new EmployeesFraction(undefined, afghanistanCode, 1)];
        companyFacts = new CompanyFacts(undefined, 0, 2345, 238, 473, 342, 234, supplyFractions, employeesFractions);
        done();
    });

    afterAll(async (done) => {
        await connection.close();
        done();
    })


    it('should calculate supplier and employees risk ratio', async (done) => {
        const stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts, regionService);
        const result = await stakeholderWeightCalculator.calculateSupplierAndEmployeesRiskRatio();
        expect(result).toBeCloseTo(17.8789386768471, 13);
        done();
    })

    it('should calculate employees risk', async (done) => {
        const stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts, regionService);
        const result = await stakeholderWeightCalculator.calculateEmployeesRisk();
        expect(result).toBeCloseTo(497.599891781823, 12);
        done();
    })

    it('should calculate financial risk', async (done) => {
        const stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts, regionService);
        const result = await stakeholderWeightCalculator.calculateFinancialRisk();
        expect(result).toBeCloseTo(66.6422308644823, 13);
        done();
    })

    it('should map to value between 60 and 300', () => {
        const stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts, regionService);
        expect(stakeholderWeightCalculator.mapToValueBetween60And300(59.999)).toBeCloseTo(
            60, 1);
        expect(stakeholderWeightCalculator.mapToValueBetween60And300(300.1)).toBeCloseTo(
            300, 1);
        expect(stakeholderWeightCalculator.mapToValueBetween60And300(60.4)).toBeCloseTo(
            60.4, 1);
        expect(stakeholderWeightCalculator.mapToValueBetween60And300(299.999)).toBeCloseTo(299.999, 3);
    })

    it('should calculate stakeholder weights', async (done) => {
        const stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts, regionService);
        let result: number = await stakeholderWeightCalculator.calcStakeholderWeight('A');
        expect(result).toBeCloseTo(0.5, 3);
        result = await stakeholderWeightCalculator.calcStakeholderWeight('B');
        expect(result).toBeCloseTo(1, 2);
        result = await stakeholderWeightCalculator.calcStakeholderWeight('C');
        expect(result).toBeCloseTo(2, 2);
        result = await stakeholderWeightCalculator.calcStakeholderWeight('D');
        expect(result).toBeCloseTo(1, 2);
        result = await stakeholderWeightCalculator.calcStakeholderWeight('E');
        expect(result).toBeCloseTo(1, 2);
        done();
    })


})