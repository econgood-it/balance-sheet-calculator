import { companyFactsFactory } from '../testData/balance.sheet';
import { EntityWithDtoMerger } from '../../src/merge/entity.with.dto.merger';

import { CompanyFacts } from '../../src/models/company.facts';
import { CompanyFactsPatchRequestBodySchema } from '../../src/dto/company.facts.dto';
import { RatingsWithDtoMerger } from '../../src/merge/ratingsWithDtoMerger';

describe('RatingWithDTOMerger', () => {
  const ratingsWithDtoMerger = new RatingsWithDtoMerger();

  beforeEach(() => {});

  describe('should merge ratings', () => {});
});
