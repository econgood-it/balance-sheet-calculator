import { Rating } from '../src/models/rating';

export function assertRatings(
  received: readonly Rating[],
  expected: readonly Rating[],
  numDigits: number = 5
) {
  function errorMsg(e: Error, received: Rating, expected: Rating): string {
    return (
      `At ${received.shortName} error occured with message \n ${e.message} \n\n` +
      `maxPoints: ${expected.maxPoints}, ${received.maxPoints} \n` +
      `points: ${expected.points}, ${received.points} \n` +
      `weight: ${expected.weight}, ${received.weight} \n` +
      `isWeightSelectedByUser: ${expected.isWeightSelectedByUser}, ${received.isWeightSelectedByUser}`
    );
  }

  for (let i = 0; i < received.length; i++) {
    try {
      expect(received[i].maxPoints).toBeCloseTo(
        expected[i].maxPoints,
        numDigits
      );
      expect(received[i].estimations).toBeCloseTo(
        expected[i].estimations,
        numDigits
      );
      expect(received[i].points).toBeCloseTo(expected[i].points, numDigits);
      expect(received[i].weight).toBeCloseTo(expected[i].weight, numDigits);
      expect(received[i].isWeightSelectedByUser).toBe(
        expected[i].isWeightSelectedByUser
      );
    } catch (e: any) {
      throw new Error(errorMsg(e, received[i], expected[i]));
    }
  }
}
