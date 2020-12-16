import path from "path";
import {RatingReader} from "../../src/reader/rating.reader";

export const readRatingResultForEmptyCompanyFacts = async () => await readRating('ratingExpectedWhenFieldsOfCompanyFactsEmpty.csv');

export const readRating = async (fileName: string) => {
  const pathToCsv = path.join(__dirname, fileName);
  const ratingReader: RatingReader = new RatingReader();
  return await ratingReader.readRatingFromCsv(pathToCsv);
}
