import {BalanceSheet} from "../../entities/balanceSheet";
import {MatrixTopicDTO} from "./matrix.topic.dto";
import {Rating} from "../../entities/rating";

export class MatrixDTO {


  constructor(public readonly topics: MatrixTopicDTO[]) {
  }

  public static fromRating(rating: Rating): MatrixDTO {
    const topics: MatrixTopicDTO[] = [];
    for (const topic of rating.topics) {
      topics.push(MatrixTopicDTO.fromTopic(topic));
    }
    return new MatrixDTO(topics);
  }
}