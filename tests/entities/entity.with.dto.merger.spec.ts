import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from "typeorm";
import { ConfigurationReader } from "../../src/configuration.reader";
import {IndustrySector} from "../../src/entities/industry.sector";
import {CompanyFacts} from "../../src/entities/companyFacts";
import {EmptyCompanyFacts, EmptyCompanyFactsJson} from "../testData/company.facts";
import {EntityWithDtoMerger} from "../../src/entities/entity.with.dto.merger";
import {Region} from "../../src/entities/region";
import {SupplyFraction} from "../../src/entities/supplyFraction";
import {EmployeesFraction} from "../../src/entities/employeesFraction";
import {CompanyFactsDTOUpdate} from "../../src/dto/update/company.facts.update.dto";
import {CompanyFactsDTOCreate} from "../../src/dto/create/company.facts.create.dto";

describe('EntityWithDTOMerger', () => {

    let connection: Connection;
    let companyFacts: CompanyFacts;
    let companyFactsRepository: Repository<CompanyFacts>;
    let entityWithDtoMerger: EntityWithDtoMerger;

    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(ConfigurationReader.read());
        entityWithDtoMerger = new EntityWithDtoMerger(
          connection.getRepository(SupplyFraction), connection.getRepository(EmployeesFraction),
          connection.getRepository(IndustrySector)
        )
        companyFactsRepository = connection.getRepository(CompanyFacts);
        done();
    });

    beforeEach(() => {
        companyFacts = EmptyCompanyFacts;
    });

    afterAll(async (done) => {
        await connection.close();
        done();
    })

    describe('should merge companyFacts', () => {
        const merge = async (json: any) => await entityWithDtoMerger.mergeCompanyFacts(
          companyFacts, CompanyFactsDTOUpdate.fromJSON(json));

        it('using totalSales from db', async (done) => {
            companyFacts.totalSales = 200;
            await merge({});
            expect(companyFacts.totalSales).toBeCloseTo(200);
            done();
        });

        it('using totalSales from dto', async (done) => {
            companyFacts.totalSales = 200;
            await merge({totalSales: 300});
            expect(companyFacts.totalSales).toBeCloseTo(300);
            done();
        });

        it('using profit from db', async (done) => {
            companyFacts.profit = 200;
            await merge({});
            expect(companyFacts.profit).toBeCloseTo(200);
            done();
        });

        it('using profit from dto', async (done) => {
            companyFacts.profit = 200;
            await merge({profit: 300});
            expect(companyFacts.profit).toBeCloseTo(300);
            done();
        });

        it('using totalPurchaseFromSuppliers from db', async (done) => {
            companyFacts.totalPurchaseFromSuppliers = 200;
            await merge({});
            expect(companyFacts.totalPurchaseFromSuppliers).toBeCloseTo(200);
            done();
        });

        it('using totalPurchaseFromSuppliers from dto', async (done) => {
            companyFacts.totalPurchaseFromSuppliers = 200;
            await merge({totalPurchaseFromSuppliers: 300});
            expect(companyFacts.totalPurchaseFromSuppliers).toBeCloseTo(300);
            done();
        });

        it('using totalStaffCosts from db', async (done) => {
            companyFacts.totalStaffCosts = 200;
            await merge({});
            expect(companyFacts.totalStaffCosts).toBeCloseTo(200);
            done();
        });

        it('using totalStaffCosts from dto', async (done) => {
            companyFacts.totalStaffCosts = 200;
            await merge({totalStaffCosts: 300});
            expect(companyFacts.totalStaffCosts).toBeCloseTo(300);
            done();
        });

        it('using financialCosts from db', async (done) => {
            companyFacts.financialCosts = 200;
            await merge({});
            expect(companyFacts.financialCosts).toBeCloseTo(200);
            done();
        });

        it('using financialCosts from dto', async (done) => {
            companyFacts.financialCosts = 200;
            await merge({financialCosts: 300});
            expect(companyFacts.financialCosts).toBeCloseTo(300);
            done();
        });

        it('using incomeFromFinancialInvestments from db', async (done) => {
            companyFacts.incomeFromFinancialInvestments = 200;
            await merge({});
            expect(companyFacts.incomeFromFinancialInvestments).toBeCloseTo(200);
            done();
        });

        it('using incomeFromFinancialInvestments from dto', async (done) => {
            companyFacts.incomeFromFinancialInvestments = 200;
            await merge({incomeFromFinancialInvestments: 300});
            expect(companyFacts.incomeFromFinancialInvestments).toBeCloseTo(300);
            done();
        });

        it('using additionsToFixedAssets from db', async (done) => {
            companyFacts.additionsToFixedAssets = 200;
            await merge({});
            expect(companyFacts.additionsToFixedAssets).toBeCloseTo(200);
            done();
        });

        it('using additionsToFixedAssets from dto', async (done) => {
            companyFacts.additionsToFixedAssets = 200;
            await merge({additionsToFixedAssets: 300});
            expect(companyFacts.additionsToFixedAssets).toBeCloseTo(300);
            done();
        });

        it('using turnover from db', async (done) => {
            companyFacts.turnover = 200;
            await merge({});
            expect(companyFacts.turnover).toBeCloseTo(200);
            done();
        });

        it('using turnover from dto', async (done) => {
            companyFacts.turnover = 200;
            await merge({turnover: 300});
            expect(companyFacts.turnover).toBeCloseTo(300);
            done();
        });

        it('using totalAssets from db', async (done) => {
            companyFacts.totalAssets = 200;
            await merge({});
            expect(companyFacts.totalAssets).toBeCloseTo(200);
            done();
        });

        it('using totalAssets from dto', async (done) => {
            companyFacts.totalAssets = 200;
            await merge({totalAssets: 300});
            expect(companyFacts.totalAssets).toBeCloseTo(300);
            done();
        });

        it('using financialAssetsAndCashBalance from db', async (done) => {
            companyFacts.financialAssetsAndCashBalance = 200;
            await merge({});
            expect(companyFacts.financialAssetsAndCashBalance).toBeCloseTo(200);
            done();
        });

        it('using financialAssetsAndCashBalance from dto', async (done) => {
            companyFacts.financialAssetsAndCashBalance = 200;
            await merge({financialAssetsAndCashBalance: 300});
            expect(companyFacts.financialAssetsAndCashBalance).toBeCloseTo(300);
            done();
        });

        it('using numberOfEmployees from db', async (done) => {
            companyFacts.numberOfEmployees = 200;
            await merge({});
            expect(companyFacts.numberOfEmployees).toBeCloseTo(200);
            done();
        });

        it('using numberOfEmployees from dto', async (done) => {
            companyFacts.numberOfEmployees = 200;
            await merge({numberOfEmployees: 300});
            expect(companyFacts.numberOfEmployees).toBeCloseTo(300);
            done();
        });

        it('using hasCanteen from db', async (done) => {
            companyFacts.hasCanteen = true;
            await merge({});
            expect(companyFacts.numberOfEmployees).toBeTruthy();
            done();
        });

        it('using hasCanteen from dto', async (done) => {
            companyFacts.hasCanteen = true;
            await merge({hasCanteen: false});
            expect(companyFacts.hasCanteen).toBeFalsy();
            done();
        });

        it('using averageJourneyToWorkForStaffInKm from db', async (done) => {
            companyFacts.averageJourneyToWorkForStaffInKm = 200;
            await merge({});
            expect(companyFacts.averageJourneyToWorkForStaffInKm).toBeCloseTo(200);
            done();
        });

        it('using averageJourneyToWorkForStaffInKm from dto', async (done) => {
            companyFacts.averageJourneyToWorkForStaffInKm = 200;
            await merge({averageJourneyToWorkForStaffInKm: 300});
            expect(companyFacts.averageJourneyToWorkForStaffInKm).toBeCloseTo(300);
            done();
        });

        it('using isB2B from db', async (done) => {
            companyFacts.isB2B = true;
            await merge({});
            expect(companyFacts.isB2B).toBeTruthy();
            done();
        });

        it('using isB2B from dto', async (done) => {
            companyFacts.isB2B = true;
            await merge({isB2B: false});
            expect(companyFacts.isB2B).toBeFalsy();
            done();
        });

    });
})