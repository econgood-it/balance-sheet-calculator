import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from "typeorm";
import { ConfigurationReader } from "../../src/configuration.reader";
import {CompanyFacts} from "../../src/entities/companyFacts";
import {EmptyCompanyFacts} from "../testData/company.facts";

describe('Company Facts entity', () => {

    let companyFactsRepository: Repository<CompanyFacts>;
    let connection: Connection;

    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(ConfigurationReader.read());
        companyFactsRepository = connection.getRepository(CompanyFacts);
        done();
    });

    afterAll(async (done) => {
        await connection.close();
        done();
    })

    describe('is saved and has the property ', () => {
        let companyFacts: CompanyFacts;
        beforeEach(() => {
            companyFacts = EmptyCompanyFacts;
        });

        it('profit', async (done) => {
            companyFacts.profit = 200;
            const result = await companyFactsRepository.save(companyFacts);
            expect(result.profit).toBe(200);
            await companyFactsRepository.remove(result);
            done();
        })

        it('financialAssetsAndCashBalance', async (done) => {
            companyFacts.financialAssetsAndCashBalance = 300;
            const result = await companyFactsRepository.save(companyFacts);
            expect(result.financialAssetsAndCashBalance).toBe(300);
            await companyFactsRepository.remove(result);
            done();
        })

        it('numberOfEmployees', async (done) => {
            companyFacts.numberOfEmployees = 300;
            const result = await companyFactsRepository.save(companyFacts);
            expect(result.numberOfEmployees).toBe(300);
            await companyFactsRepository.remove(result);
            done();
        })

        it('hasCanteen', async (done) => {
            companyFacts.hasCanteen = true;
            const result = await companyFactsRepository.save(companyFacts);
            expect(result.hasCanteen).toBeTruthy();
            await companyFactsRepository.remove(result);
            done();
        })

        it('averageJourneyToWorkForStaffInKm', async (done) => {
            companyFacts.averageJourneyToWorkForStaffInKm = 200;
            const result = await companyFactsRepository.save(companyFacts);
            expect(result.averageJourneyToWorkForStaffInKm).toBeCloseTo(200);
            await companyFactsRepository.remove(result);
            done();
        })

        it('isB2B', async (done) => {
            companyFacts.isB2B = true;
            const result = await companyFactsRepository.save(companyFacts);
            expect(result.isB2B).toBeTruthy();
            await companyFactsRepository.remove(result);
            done();
        })

    });


})