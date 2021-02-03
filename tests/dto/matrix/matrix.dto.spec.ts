import {RatingFactory} from "../../../src/factories/rating.factory";
import {BalanceSheet} from "../../../src/entities/balanceSheet";
import {BalanceSheetType, BalanceSheetVersion} from "../../../src/entities/enums";
import {EmptyCompanyFacts} from "../../testData/company.facts";
import {MatrixDTO} from "../../../src/dto/matrix/matrix.dto";
import {Rating} from "../../../src/entities/rating";


describe('Matrix DTO', () => {
  let rating: Rating;

  beforeEach(async (done) => {
    rating = await RatingFactory.createDefaultRating(BalanceSheetType.Full, BalanceSheetVersion.v5_0_4);
    done();
  });

  it('is created from rating',  async (done) => {
    const matrixDTO = MatrixDTO.fromRating(rating);
    expect(matrixDTO).toBeDefined();
    done()
  })

  it('has a topics array of 20',  async (done) => {
    const matrixDTO = MatrixDTO.fromRating(rating);
    expect(matrixDTO.topics).toHaveLength(20);
    done()
  })

})