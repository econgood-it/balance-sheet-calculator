import { RatingRequestBodySchema } from '../../src/dto/rating.dto';

describe('RatingRequestBodySchema', () => {
  it('parse json as aspect', () => {
    const json = {
      shortName: 'A1.1',
      estimations: 5,
      weight: 1,
    };
    const rating = RatingRequestBodySchema.parse(json);
    expect(rating).toMatchObject({ ...json });
  });

  it('parse json as topic', () => {
    const json = {
      shortName: 'A1',
      estimations: 5,
      weight: 1,
    };
    const rating = RatingRequestBodySchema.parse(json);
    expect(rating).toMatchObject({ ...json });
  });

  it('parsing of json fails on invalid weight', () => {
    const json = {
      shortName: 'A1',
      estimations: 5,
      weight: 3,
    };
    const result = RatingRequestBodySchema.safeParse(json);
    expect(result.success).toBeFalsy();
    expect(!result.success && result.error.errors[0].message).toBe(
      'Weight has to be one of the following values 0,0.5,1,1.5,2'
    );
  });
});
