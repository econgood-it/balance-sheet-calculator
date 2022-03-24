import { Rating } from '../src/entities/rating';
import { CompanyFacts } from '../src/entities/companyFacts';

export class Assertions {
  public static assertRatings(
    received: Rating[],
    expected: Rating[],
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
      } catch (e: any) {
        throw new Error(Assertions.errorMsg(e, received[i], expected[i]));
      }
    }
  }

  private static errorMsg(
    e: Error,
    received: Rating,
    expected: Rating
  ): string {
    return (
      `At ${received.shortName} error occured with message \n ${e.message} \n\n` +
      `maxPoints: ${expected.maxPoints}, ${received.maxPoints} \n` +
      `points: ${expected.points}, ${received.points} \n` +
      `weight: ${expected.weight}, ${received.weight} \n` +
      `isWeightSelectedByUser: ${expected.isWeightSelectedByUser}, ${received.isWeightSelectedByUser}`
    );
  }

  public static rmIdFieldsOfCompanyFacts(companyFacts: CompanyFacts) {
    delete (companyFacts as any).id;
  }
}
