import {BalanceSheet} from "../../entities/balanceSheet";
import {MatrixTopicDTO} from "./matrix.topic.dto";
import {Rating} from "../../entities/rating";
import {Translations} from "../../entities/Translations";

export class MatrixDTO {


  constructor(public readonly topics: MatrixTopicDTO[]) {
  }

  public static fromRating(rating: Rating, language: keyof Translations): MatrixDTO {
    const topics: MatrixTopicDTO[] = [];
    for (const topic of rating.topics) {
      topics.push(MatrixTopicDTO.fromTopic(topic, language));
    }
    return new MatrixDTO(topics);
  }
}