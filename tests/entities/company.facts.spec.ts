import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from "typeorm";
import { ConfigurationReader } from "../../src/configuration.reader";
import {IndustrySector} from "../../src/entities/industry.sector";
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

        it('totalSales', async (done) => {
            companyFacts.totalSales = 300;
            const result = await companyFactsRepository.save(companyFacts);
            expect(result.totalSales).toBe(300);
            await companyFactsRepository.remove(result);
            done();
        })
    });


})