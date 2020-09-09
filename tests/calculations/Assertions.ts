import { Topic } from "../../src/entities/topic";
import { PositiveAspect } from "../../src/entities/positiveAspect";
import { NegativeAspect } from "../../src/entities/negativeAspect";

export class Assertions {
    public static assertTopics(received: Topic[], expected: Topic[], withAspects: boolean = true) {
        for (let i = 0; i < received.length; i++) {
            const numDigits = 15;
            try {
                expect(received[i].maxPoints).toBeCloseTo(expected[i].maxPoints, numDigits);
                expect(received[i].points).toBeCloseTo(expected[i].points, numDigits);
            } catch (e) {
                throw new Error(`At topic ${received[i].shortName} error occured with message \n ${e.message}`);
            }
            if (withAspects) {
                Assertions.assertAspects(received[i].positiveAspects, expected[i].positiveAspects);
                Assertions.assertAspects(received[i].negativeAspects, expected[i].negativeAspects);
            }
        }
    };

    public static assertAspects(received: PositiveAspect[] | NegativeAspect[],
        expected: PositiveAspect[] | NegativeAspect[]) {
        for (let i = 0; i < received.length; i++) {
            const numDigits = 15;
            try {
                expect(received[i].maxPoints).toBeCloseTo(expected[i].maxPoints, numDigits);
                expect(received[i].points).toBeCloseTo(expected[i].points, numDigits);
            } catch (e) {
                throw new Error(`At aspect ${received[i].shortName} error occured with message \n ${e.message}`);
            }
        }
    };

}