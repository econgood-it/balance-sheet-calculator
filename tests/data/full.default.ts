import { Rating } from "../../src/entities/rating";
import { Topic } from "../../src/entities/topic";
import { PositiveAspect } from "../../src/entities/positiveAspect";
import { NegativeAspect } from "../../src/entities/negativeAspect";
import { CompanyFacts } from "../../src/entities/companyFacts";

const topicDefaultMaxPoints = 51.28205128205128;
const topicDefaultMaxPointsA4 = 25.64102564102564;
const negativeDefaultMaxPoints = -205.1282051282051;
const oneAspectDefaultMaxPoints = topicDefaultMaxPoints;
const twoAspectDefaultMaxPoints = 25.64102564102564;
const twoAspectDefaultMaxPointsA4 = 12.82051282051282;
const threeAspectDefaultMaxPoints = 17.094017094017094;
const defaultEstimations = 0;
const defaultPoints = defaultEstimations;
const defaultWeight = 1;
const defaultWeightA4 = 0.5;

export const CompanyFactsDefault = new CompanyFacts(undefined, 0, 0, 0, 0, 0, 0, [], []);

export const RatingDefault = new Rating(undefined,
    [
        new Topic(undefined, "A1", "A1 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, 1,
            [new PositiveAspect(undefined, 'A1.1', 'A1.1 name', defaultEstimations, defaultPoints, oneAspectDefaultMaxPoints, 1)],
            [new NegativeAspect(undefined, 'A1.2', 'A1.2 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "A2", "A2 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'A2.1', 'A2.1 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'A2.2', 'A2.2 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1)
            ],
            [new NegativeAspect(undefined, 'A2.3', 'A2.3 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "A3", "A3 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [new PositiveAspect(undefined, 'A3.1', 'A3.1 name', defaultEstimations, defaultPoints, oneAspectDefaultMaxPoints, 1)],
            [new NegativeAspect(undefined, 'A3.2', 'A3.2 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "A4", "A4 name", defaultEstimations, defaultPoints, topicDefaultMaxPointsA4, defaultWeightA4,
            [
                new PositiveAspect(undefined, 'A4.1', 'A4.1 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPointsA4, 1),
                new PositiveAspect(undefined, 'A4.2', 'A4.2 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPointsA4, 1)
            ],
            []
        ),
        new Topic(undefined, "B1", "B1 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'B1.1', 'B1.1 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'B1.2', 'B1.2 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'B1.3', 'B1.3 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1)
            ],
            []
        ),
        new Topic(undefined, "B2", "B2 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [new PositiveAspect(undefined, 'B2.1', 'B2.1 name', defaultEstimations, defaultPoints, oneAspectDefaultMaxPoints, 1)],
            [new NegativeAspect(undefined, 'B2.2', 'B2.2 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "B3", "B3 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'B3.1', 'B3.1 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'B3.2', 'B3.2 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1)
            ],
            [new NegativeAspect(undefined, 'B3.2', 'B3.2 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "B4", "B4 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [new PositiveAspect(undefined, 'B4.1', 'B4.1 name', defaultEstimations, defaultPoints, oneAspectDefaultMaxPoints, 1),],
            [new NegativeAspect(undefined, 'B4.2', 'B4.2 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "C1", "C1 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'C1.1', 'C1.1 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'C1.2', 'C1.2 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'C1.3', 'C1.3 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
            ],
            [new NegativeAspect(undefined, 'C1.4', 'C1.4 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "C2", "C2 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'C2.1', 'C1.1 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'C2.2', 'C2.2 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'C2.3', 'C2.3 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
            ],
            [new NegativeAspect(undefined, 'C2.4', 'C2.4 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "C3", "C3 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'C3.1', 'C3.1 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'C3.2', 'C3.2 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'C3.3', 'C3.3 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
            ],
            [new NegativeAspect(undefined, 'C3.4', 'C3.4 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]),
        new Topic(undefined, "C4", "C4 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'C4.1', 'C4.1 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'C4.2', 'C4.2 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'C4.3', 'C4.3 name', defaultEstimations, defaultPoints, threeAspectDefaultMaxPoints, 1),
            ],
            [new NegativeAspect(undefined, 'C4.4', 'C4.4 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "D1", "D1 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'D1.1', 'D1.1 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'D1.2', 'D2.2 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
            ],
            [new NegativeAspect(undefined, 'D1.3', 'D1.3 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]),
        new Topic(undefined, "D2", "D2 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'D2.1', 'D2.1 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'D2.2', 'D2.2 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
            ],
            [new NegativeAspect(undefined, 'D2.3', 'D2.3 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "D3", "D3 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'D3.1', 'D3.1 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'D3.2', 'D3.2 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
            ],
            [new NegativeAspect(undefined, 'D3.3', 'D3.3 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "D4", "D4 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'D4.1', 'D4.1 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'D4.2', 'D4.2 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
            ],
            [new NegativeAspect(undefined, 'D4.3', 'D4.3 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "E1", "E1 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'E1.1', 'E1.1 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'E1.2', 'E1.2 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
            ],
            [new NegativeAspect(undefined, 'E1.3', 'E1.3 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        ),
        new Topic(undefined, "E2", "E2 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'E2.1', 'E2.1 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'E2.2', 'E2.2 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
            ],
            [
                new NegativeAspect(undefined, 'E2.3', 'E2.3 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints),
                new NegativeAspect(undefined, 'E2.4', 'E2.4 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)
            ]
        ),
        new Topic(undefined, "E3", "E3 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'E3.1', 'E3.1 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'E3.2', 'E3.2 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
            ],
            [new NegativeAspect(undefined, 'E3.3', 'E3.3 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]),
        new Topic(undefined, "E4", "E4 name", defaultEstimations, defaultPoints, topicDefaultMaxPoints, defaultWeight,
            [
                new PositiveAspect(undefined, 'E4.1', 'E4.1 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
                new PositiveAspect(undefined, 'E4.2', 'E4.2 name', defaultEstimations, defaultPoints, twoAspectDefaultMaxPoints, 1),
            ],
            [new NegativeAspect(undefined, 'E4.3', 'E4.3 name', defaultEstimations, defaultPoints, negativeDefaultMaxPoints)]
        )
    ]
);