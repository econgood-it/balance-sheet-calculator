import {StakeholderWeightCalculator} from "../../src/calculations/StakeholderWeightCalculator";
import Region, {IRegion} from "../../src/models/region.model";
import SupplyFraction, {ISupplyFraction} from "../../src/models/supplyFractions.model";
import EmployeesFraction, {IEmployeesFrations} from "../../src/models/employeesFractions.model";
import CompanyFacts, {ICompanyFacts} from "../../src/models/companyFacts.model";
import mongoose from "mongoose";
import {Environment} from "../../src/environment";
import {TestDataFactory} from "./TestData";
import Topic, {ITopic} from "../../src/models/topic.model";
import {MaxPointsCalculator} from "../../src/calculations/MaxPointsCalculator";

describe('Max points calculator', () => {

    let companyFacts: ICompanyFacts;
    let testDataFactory: TestDataFactory;

    beforeAll(async (done) => {
        testDataFactory = new TestDataFactory();
        companyFacts = await testDataFactory.createDefaultCompanyFacts();
        done();
    });

    it('should calculate max points of topics', async (done) => {
        const topics: ITopic[] = [
            new Topic({shortName: "A1", name: "A1 name", estimations: 5, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "A2", name: "A2 name", estimations: 29, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "A3", name: "A3 name", estimations: 93, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "A4", name: "A4 name", estimations: 93, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B1", name: "B1 name", estimations: 2, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B2", name: "B2 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B3", name: "B3 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B4", name: "B4 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C1", name: "C1 name", estimations: 2, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C2", name: "C2 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C3", name: "C3 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C4", name: "C4 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D1", name: "D1 name", estimations: 2, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D2", name: "D2 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D3", name: "D3 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D4", name: "D4 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E1", name: "E1 name", estimations: 2, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E2", name: "E2 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E3", name: "E3 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E4", name: "E4 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
        ]
        const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(companyFacts);
        maxPointsCalculator.updateMaxPointsOfTopics(topics);
        const maxPointsA = 22.727272727272727;
        const expected: ITopic[] = [
            new Topic({shortName: "A1", name: "A1 name", estimations: 5, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "A2", name: "A2 name", estimations: 29, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "A3", name: "A3 name", estimations: 93, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "A4", name: "A4 name", estimations: 93, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B1", name: "B1 name", estimations: 2, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B2", name: "B2 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B3", name: "B3 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B4", name: "B4 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C1", name: "C1 name", estimations: 2, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C2", name: "C2 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C3", name: "C3 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C4", name: "C4 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D1", name: "D1 name", estimations: 2, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D2", name: "D2 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D3", name: "D3 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D4", name: "D4 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E1", name: "E1 name", estimations: 2, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E2", name: "E2 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E3", name: "E3 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E4", name: "E4 name", estimations: 102, points: 0, maxPoints: 51, weight: 1}),
        ]

        expect(topics).toEqual(expected);
        done();
    })

    afterAll(async (done) => {
        await testDataFactory.deleteDefaultRegionsFromDatabase();
        try {
            // Connection to Mongo killed
            await mongoose.disconnect();
        } catch (error) {
            console.log(`You did something wrong dummy!${error}`);
            throw error;
        }
        done();
    })
})