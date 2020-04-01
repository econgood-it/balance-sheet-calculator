import Rating, {IRating} from "../models/rating.model";
import Topic, {ITopic} from "../models/topic.model";

export class RatingFactory {
    public createDefaultRating(): IRating {
        const topics: ITopic[] = [
            new Topic({shortName: "A1", name: "A1 name",
                estimations: 0, points: 0, maxPoints: 51, weight: 1})]
        return new Rating( {topics: topics } )
    };
}