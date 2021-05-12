import { Aspect } from '../src/entities/aspect';
import { Rating } from '../src/entities/rating';
import { Topic } from '../src/entities/topic';
import { CompanyFacts } from '../src/entities/companyFacts';

export class Assertions {
  public static assertTopics(
    received: Topic[],
    expected: Topic[],
    withAspects: boolean = true,
    numDigits: number = 5
  ) {
    for (let i = 0; i < received.length; i++) {
      try {
        expect(received[i].maxPoints).toBeCloseTo(
          expected[i].maxPoints,
          numDigits
        );
        expect(received[i].points).toBeCloseTo(expected[i].points, numDigits);
        expect(received[i].weight).toBeCloseTo(expected[i].weight, numDigits);
        expect(received[i].name).toBe(expected[i].name);
        expect(received[i].isWeightSelectedByUser).toBe(
          expected[i].isWeightSelectedByUser
        );
      } catch (e) {
        throw new Error(Assertions.errorMsg(e, received[i], expected[i]));
      }
      if (withAspects) {
        Assertions.assertAspects(received[i].aspects, expected[i].aspects);
      }
    }
  }

  public static assertAspects(
    received: Aspect[] | Aspect[],
    expected: Aspect[] | Aspect[],
    numDigits: number = 5
  ) {
    for (let i = 0; i < received.length; i++) {
      try {
        expect(received[i].maxPoints).toBeCloseTo(
          expected[i].maxPoints,
          numDigits
        );
        expect(received[i].points).toBeCloseTo(expected[i].points, numDigits);
        expect(received[i].weight).toBeCloseTo(expected[i].weight, numDigits);
        expect(received[i].name).toBe(expected[i].name);
        expect(received[i].isWeightSelectedByUser).toBe(
          expected[i].isWeightSelectedByUser
        );
      } catch (e) {
        throw new Error(Assertions.errorMsg(e, received[i], expected[i]));
      }
    }
  }

  private static errorMsg(
    e: Error,
    received: Topic | Aspect,
    expected: Topic | Aspect
  ): string {
    const type = received instanceof Topic ? 'topic' : 'aspect';
    return (
      `At ${type} ${received.shortName} error occured with message \n ${e.message} \n\n` +
      `maxPoints: ${expected.maxPoints}, ${received.maxPoints} \n` +
      `points: ${expected.points}, ${received.points} \n` +
      `weight: ${expected.weight}, ${received.weight} \n` +
      `isWeightSelectedByUser: ${expected.isWeightSelectedByUser}, ${received.isWeightSelectedByUser}`
    );
  }

  public static rmIdFieldsOfCompanyFacts(companyFacts: CompanyFacts) {
    delete (companyFacts as any).id;
  }

  public static rmIdFields(rating: Rating) {
    delete (rating as any).id;
    for (const topic of rating.topics) {
      delete (topic as any).id;
      for (const aspect of topic.aspects) {
        delete (aspect as any).id;
      }
    }
  }
}
