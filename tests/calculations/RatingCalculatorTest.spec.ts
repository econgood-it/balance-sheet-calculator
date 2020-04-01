import {RatingCalculator} from "../../src/calculations/RatingCalculator";

describe('Movies API', () => {
    it('should create a new movie', () => {
        const ratingCalculator = new RatingCalculator();
        expect(ratingCalculator.calc(5)).toBe(4);
    })
})