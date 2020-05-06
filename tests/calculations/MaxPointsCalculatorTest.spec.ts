import {ICompanyFacts} from "../../src/models/companyFacts.model";
import Topic, {ITopic} from "../../src/models/topic.model";
import {MaxPointsCalculator} from "../../src/calculations/MaxPointsCalculator";
import {DatabaseHandler} from "../testData/DatabaseHandler";
import {TestDataFactory} from "../testData/TestDataFactory";

function assertTopics(received: ITopic[], expected: ITopic[]) {
    for (let i = 0; i < received.length ; i++) {
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

    let companyFacts: ICompanyFacts;
    let testDataFactory: TestDataFactory;

    beforeAll(async (done) => {
        DatabaseHandler.connectIfDisconnected();
        testDataFactory = new TestDataFactory();
        companyFacts = await testDataFactory.createDefaultCompanyFacts();
        done();
    });

    afterAll(async (done) => {
        await DatabaseHandler.deleteAllEntriesAnddisconnect();
        done();
    })

    it('should calculate max points of topics', async (done) => {
        const topics: ITopic[] = [
            new Topic({shortName: "A1", name: "A1 name", estimations: 0, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "A2", name: "A2 name", estimations: 4, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "A3", name: "A3 name", estimations: 6, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "A4", name: "A4 name", estimations: 10, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B1", name: "B1 name", estimations: 0, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B2", name: "B2 name", estimations: 4, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B3", name: "B3 name", estimations: 6, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B4", name: "B4 name", estimations: 10, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C1", name: "C1 name", estimations: 0, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C2", name: "C2 name", estimations: 4, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C3", name: "C3 name", estimations: 6, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C4", name: "C4 name", estimations: 10, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D1", name: "D1 name", estimations: 0, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D2", name: "D2 name", estimations: 4, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D3", name: "D3 name", estimations: 6, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D4", name: "D4 name", estimations: 10, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E1", name: "E1 name", estimations: 0, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E2", name: "E2 name", estimations: 4, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E3", name: "E3 name", estimations: 6, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E4", name: "E4 name", estimations: 10, points: 0, maxPoints: 51, weight: 1}),
        ]
        const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(companyFacts);
        await maxPointsCalculator.updateMaxPointsOfTopics(topics);
        const maxPointsA = 22.727272727272727;
        const maxPointsBDE = 45.45454545454545;
        const maxPointsC = 90.9090909090909;
        const expected: ITopic[] = [
            new Topic({shortName: "A1", name: "A1 name", estimations: 0, points: 0, maxPoints: maxPointsA, weight: 1}),
            new Topic({shortName: "A2", name: "A2 name", estimations: 4, points: 9.09090909090909, maxPoints: maxPointsA, weight: 1}),
            new Topic({shortName: "A3", name: "A3 name", estimations: 6, points: 13.636363636363637, maxPoints: maxPointsA, weight: 1}),
            new Topic({shortName: "A4", name: "A4 name", estimations: 10, points: maxPointsA, maxPoints: maxPointsA, weight: 1}),
            new Topic({shortName: "B1", name: "B1 name", estimations: 0, points: 0, maxPoints: maxPointsBDE, weight: 1}),
            new Topic({shortName: "B2", name: "B2 name", estimations: 4, points: 18.18181818181818, maxPoints: maxPointsBDE, weight: 1}),
            new Topic({shortName: "B3", name: "B3 name", estimations: 6, points: 27.272727272727273, maxPoints: maxPointsBDE, weight: 1}),
            new Topic({shortName: "B4", name: "B4 name", estimations: 10, points: maxPointsBDE, maxPoints: maxPointsBDE, weight: 1}),
            new Topic({shortName: "C1", name: "C1 name", estimations: 0, points: 0, maxPoints: maxPointsC, weight: 1}),
            new Topic({shortName: "C2", name: "C2 name", estimations: 4, points: 36.36363636363636, maxPoints: maxPointsC, weight: 1}),
            new Topic({shortName: "C3", name: "C3 name", estimations: 6, points: 54.54545454545455, maxPoints: maxPointsC, weight: 1}),
            new Topic({shortName: "C4", name: "C4 name", estimations: 10, points: maxPointsC, maxPoints: maxPointsC, weight: 1}),
            new Topic({shortName: "D1", name: "D1 name", estimations: 0, points: 0, maxPoints: maxPointsBDE, weight: 1}),
            new Topic({shortName: "D2", name: "D2 name", estimations: 4, points: 18.18181818181818, maxPoints: maxPointsBDE, weight: 1}),
            new Topic({shortName: "D3", name: "D3 name", estimations: 6, points: 27.272727272727273, maxPoints: maxPointsBDE, weight: 1}),
            new Topic({shortName: "D4", name: "D4 name", estimations: 10, points: maxPointsBDE, maxPoints: maxPointsBDE, weight: 1}),
            new Topic({shortName: "E1", name: "E1 name", estimations: 0, points: 0, maxPoints: maxPointsBDE, weight: 1}),
            new Topic({shortName: "E2", name: "E2 name", estimations: 4, points: 18.18181818181818, maxPoints: maxPointsBDE, weight: 1}),
            new Topic({shortName: "E3", name: "E3 name", estimations: 6, points: 27.272727272727273, maxPoints: maxPointsBDE, weight: 1}),
            new Topic({shortName: "E4", name: "E4 name", estimations: 10, points: maxPointsBDE, maxPoints: maxPointsBDE, weight: 1}),
        ]
        assertTopics(topics, expected);
        done();
    })

})