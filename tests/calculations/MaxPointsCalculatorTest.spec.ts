
import { MaxPointsCalculator } from "../../src/calculations/MaxPointsCalculator";
import { Topic } from "../../src/entities/topic";
import { CompanyFacts } from "../../src/entities/companyFacts";
import { SupplyFraction } from "../../src/entities/supplyFraction";
import { EmployeesFraction } from "../../src/entities/employeesFraction";
import { Connection, Repository } from "typeorm";
import RegionService from "../../src/services/region.service";
import { Region } from "../../src/entities/region";
import { DatabaseConnectionCreator } from '../../src/DatabaseConnectionCreator';

function assertTopics(received: Topic[], expected: Topic[]) {
    for (let i = 0; i < received.length; i++) {
        const numDigits = 15;
        try {
            expect(received[i].maxPoints).toBeCloseTo(expected[i].maxPoints, numDigits);
            expect(received[i].points).toBeCloseTo(expected[i].points, numDigits);
        } catch (e) {
            throw new Error(`At index ${i} error occured with message \n ${e.message}`);
        }
    }
};



describe('Max points calculator', () => {


    let connection: Connection;
    let regionService: RegionService;
    let regionRepository: Repository<Region>;
    const arabEmiratesCode = "ARE";
    const afghanistanCode = "AFG";
    const regions = [new Region(2.050108031355940, arabEmiratesCode, "United Arab Emirates"), new Region(3.776326416513620, afghanistanCode, "Afghanistan")]

    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnection();
        regionRepository = connection.getRepository(Region)
        regionService = new RegionService(regionRepository);
        for (const region of regions) {
            await regionRepository.save(regions);
        }
        const supplyFractions: SupplyFraction[] = [new SupplyFraction(arabEmiratesCode, 300), new SupplyFraction(afghanistanCode, 20)];
        const employeesFractions: EmployeesFraction[] = [new EmployeesFraction(arabEmiratesCode, 0.3), new EmployeesFraction(afghanistanCode, 1)];
        done();
    });

    afterAll(async (done) => {
        for (const region of regions) {
            await regionRepository.delete(region);
        }
        await connection.close();
        done();
    })


    it('should calculate max points of topics', async (done) => {
        const supplyFractions: SupplyFraction[] = [new SupplyFraction(arabEmiratesCode, 300), new SupplyFraction(afghanistanCode, 20)];
        const employeesFractions: EmployeesFraction[] = [new EmployeesFraction(arabEmiratesCode, 0.3), new EmployeesFraction(afghanistanCode, 1)];
        const companyFacts: CompanyFacts = new CompanyFacts(0, 2345, 238, 473, 342, 234, supplyFractions, employeesFractions);
        const topics: Topic[] = [
            new Topic("A1", "A1 name", 0, 0, 51, 1),
            new Topic("A2", "A2 name", 4, 0, 51, 1),
            new Topic("A3", "A3 name", 6, 0, 51, 1),
            new Topic("A4", "A4 name", 10, 0, 51, 1),
            new Topic("B1", "B1 name", 0, 0, 51, 1),
            new Topic("B2", "B2 name", 4, 0, 51, 1),
            new Topic("B3", "B3 name", 6, 0, 51, 1),
            new Topic("B4", "B4 name", 10, 0, 51, 1),
            new Topic("C1", "C1 name", 0, 0, 51, 1),
            new Topic("C2", "C2 name", 4, 0, 51, 1),
            new Topic("C3", "C3 name", 6, 0, 51, 1),
            new Topic("C4", "C4 name", 10, 0, 51, 1),
            new Topic("D1", "D1 name", 0, 0, 51, 1),
            new Topic("D2", "D2 name", 4, 0, 51, 1),
            new Topic("D3", "D3 name", 6, 0, 51, 1),
            new Topic("D4", "D4 name", 10, 0, 51, 1),
            new Topic("E1", "E1 name", 0, 0, 51, 1),
            new Topic("E2", "E2 name", 4, 0, 51, 1),
            new Topic("E3", "E3 name", 6, 0, 51, 1),
            new Topic("E4", "E4 name", 10, 0, 51, 1),
        ]
        const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(companyFacts, regionService);
        await maxPointsCalculator.updateMaxPointsOfTopics(topics);
        const maxPointsA = 22.727272727272727;
        const maxPointsBDE = 45.45454545454545;
        const maxPointsC = 90.9090909090909;
        const expected: Topic[] = [
            new Topic("A1", "A1 name", 0, 0, maxPointsA, 1),
            new Topic("A2", "A2 name", 4, 9.09090909090909, maxPointsA, 1),
            new Topic("A3", "A3 name", 6, 13.636363636363637, maxPointsA, 1),
            new Topic("A4", "A4 name", 10, maxPointsA, maxPointsA, 1),
            new Topic("B1", "B1 name", 0, 0, maxPointsBDE, 1),
            new Topic("B2", "B2 name", 4, 18.18181818181818, maxPointsBDE, 1),
            new Topic("B3", "B3 name", 6, 27.272727272727273, maxPointsBDE, 1),
            new Topic("B4", "B4 name", 10, maxPointsBDE, maxPointsBDE, 1),
            new Topic("C1", "C1 name", 0, 0, maxPointsC, 1),
            new Topic("C2", "C2 name", 4, 36.36363636363636, maxPointsC, 1),
            new Topic("C3", "C3 name", 6, 54.54545454545455, maxPointsC, 1),
            new Topic("C4", "C4 name", 10, maxPointsC, maxPointsC, 1),
            new Topic("D1", "D1 name", 0, 0, maxPointsBDE, 1),
            new Topic("D2", "D2 name", 4, 18.18181818181818, maxPointsBDE, 1),
            new Topic("D3", "D3 name", 6, 27.272727272727273, maxPointsBDE, 1),
            new Topic("D4", "D4 name", 10, maxPointsBDE, maxPointsBDE, 1),
            new Topic("E1", "E1 name", 0, 0, maxPointsBDE, 1),
            new Topic("E2", "E2 name", 4, 18.18181818181818, maxPointsBDE, 1),
            new Topic("E3", "E3 name", 6, 27.272727272727273, maxPointsBDE, 1),
            new Topic("E4", "E4 name", 10, maxPointsBDE, maxPointsBDE, 1),
        ]
        assertTopics(topics, expected);
        done();
    })

})