import Rating, {IRating} from "../models/rating.model";
import Topic, {ITopic} from "../models/topic.model";

export class RatingFactory {
    public createDefaultRating(): IRating {
        const topics: ITopic[] = [
            new Topic({shortName: "A1", name: "A1 name",
                estimations: 0, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "B1", name: "B1 name",
                estimations: 0, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "C1", name: "C1 name",
                estimations: 0, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "D1", name: "D1 name",
                estimations: 0, points: 0, maxPoints: 51, weight: 1}),
            new Topic({shortName: "E1", name: "E1 name",
                estimations: 0, points: 0, maxPoints: 51, weight: 1})
        ]
        return new Rating( {topics: topics } )
    };
}