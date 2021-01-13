import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from "typeorm";
import { ConfigurationReader } from "../../src/configuration.reader";
import {Industry} from "../../src/entities/industry";

describe('Industry', () => {

    let industryRepository: Repository<Industry>;
    let connection: Connection;

    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(ConfigurationReader.read());
        industryRepository = connection.getRepository(Industry);
        done();
    });

    afterAll(async (done) => {
        await connection.close();
        done();
    })

    it('should be saved and deleted', async (done) => {
        const industry: Industry = new Industry(undefined, 2, 1, 'NEWCODE');
        const result = await industryRepository.save(industry);
        expect(result.industryCode).toBe('NEWCODE');
        expect(result.ecologicalSupplyChainRisk).toBe(2);
        await industryRepository.remove(result);
        done();
    })

})