import { Aspect } from "../../src/entities/aspect";
import { Topic } from "../../src/entities/topic";


export class Assertions {
    public static assertTopics(received: Topic[], expected: Topic[], withAspects: boolean = true, numDigits: number = 5) {
        for (let i = 0; i < received.length; i++) {
            try {
                expect(received[i].maxPoints).toBeCloseTo(expected[i].maxPoints, numDigits);
                expect(received[i].points).toBeCloseTo(expected[i].points, numDigits);
                expect(received[i].weight).toBeCloseTo(expected[i].weight, numDigits);
                expect(received[i].isWeightSelectedByUser).toBe(expected[i].isWeightSelectedByUser);
            } catch (e) {
                throw new Error(`At topic ${received[i].shortName} error occured with message \n ${e.message}`);
            }
            if (withAspects) {
                Assertions.assertAspects(received[i].aspects, expected[i].aspects);
            }
        }
    };

    public static assertAspects(received: Aspect[] | Aspect[],
        expected: Aspect[] | Aspect[], numDigits: number = 5) {
        for (let i = 0; i < received.length; i++) {
            try {
                expect(received[i].maxPoints).toBeCloseTo(expected[i].maxPoints, numDigits);
                expect(received[i].points).toBeCloseTo(expected[i].points, numDigits);
                expect(received[i].weight).toBeCloseTo(expected[i].weight, numDigits);
                expect(received[i].isWeightSelectedByUser).toBe(expected[i].isWeightSelectedByUser);
            } catch (e) {
                throw new Error(`At aspect ${received[i].shortName} error occured with message \n ${e.message}`);
            }
        }
    };

}