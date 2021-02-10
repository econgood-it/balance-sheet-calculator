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

  it('has topic A1 with 30 of 50 reached points',  async (done) => {
    rating.topics[0].points = 30;
    rating.topics[0].maxPoints = 50;
    const matrixDTO = MatrixDTO.fromRating(rating);
    expect(matrixDTO.topics[0].points).toBe(30);
    expect(matrixDTO.topics[0].maxPoints).toBe(50);
    done()
  })

  it('has topic E4 with 20 of 60 reached points',  async (done) => {
    rating.topics[0].points = 20;
    rating.topics[0].maxPoints = 60;
    const matrixDTO = MatrixDTO.fromRating(rating);
    expect(matrixDTO.topics[0].points).toBe(20);
    expect(matrixDTO.topics[0].maxPoints).toBe(60);
    done()
  })

})