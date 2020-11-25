import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from "typeorm";
import { ConfigurationReader } from "../../src/configuration.reader";
import {IndustrySector} from "../../src/entities/industry.sector";

describe('Industry Sector', () => {

    let industrySectorRepository: Repository<IndustrySector>;
    let connection: Connection;

    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(ConfigurationReader.read());
        industrySectorRepository = connection.getRepository(IndustrySector);
        done();
    });

    afterAll(async (done) => {
        await connection.close();
        done();
    })


    it('should save and delete industry sector', async (done) => {
        const industrySector: IndustrySector = new IndustrySector(undefined, 'A', 3.44,
          'My description');
        const result = await industrySectorRepository.save(industrySector);
        expect(result.industryCode).toBe('A');
        expect(result.amountOfTotalTurnover).toBe(3.44);
        expect(result.description).toBe('My description');
        await industrySectorRepository.remove(result);
        done();
    })

})