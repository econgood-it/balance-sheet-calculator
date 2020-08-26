import { TopicDTOCreate } from "../dto/create/topicCreate.dto";
import { RatingDTOCreate } from "../dto/create/ratingCreate.dto";
import { PositiveAspectDTOCreate } from "../dto/create/positiveAspectCreate.dto";
import { BalanceSheetType } from "../entities/enums";

export class RatingFactory {
    private static readonly DEFAULT_WEIGHT = 1;
    private static readonly DEFAULT_ESTIMATION = 0;

    public static createDefaultRating(balanceSheetType: BalanceSheetType): RatingDTOCreate {

        return new RatingDTOCreate([
            new TopicDTOCreate('A1', 'Human dignity in the supply chain', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, RatingFactory.createAspectsForTopicA1(balanceSheetType), []),
            new TopicDTOCreate('A2', 'Solidarity and social justice in the supply chain', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, RatingFactory.createAspectsForTopicA2(balanceSheetType), []),
            new TopicDTOCreate('A3', 'Environmental sustainability in the supply chain', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('A4', 'Transparency & co-determination in the supply chain', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('B1', 'Ethical position in relation to financial resources', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('B2', 'Social position in relation to financial resources', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('B3', 'Use of funds in relation to social and environmental impacts', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('B4', 'Ownership and co-determination', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('C1', 'Human dignity in the workplace and working environment', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('C2', 'Self-determined working arrangements', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('C3', 'Environmentally-friendly behaviour of staff', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('C4', 'Co-determination and transparency within the organisation', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('D1', 'Ethical customer relations', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('D2', 'Cooperation and solidarity with other companies', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('D3', 'Impact on the environment of the use and disposal of products and services', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('D4', 'Customer participation and product transparency', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('E1', 'Purpose of products and services and their effects on society', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('E2', 'Contribution to the community', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('E3', 'Reduction of environmental impact', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
            new TopicDTOCreate('E4', 'Social co-determination and transparency', RatingFactory.DEFAULT_ESTIMATION,
                RatingFactory.DEFAULT_WEIGHT, [], []),
        ])
    }

    private static createAspectsForTopicA1(balanceSheetType: BalanceSheetType) {
        const aspects = [new PositiveAspectDTOCreate('A1.1', 'Working conditions and social impact in the supply chain',
            RatingFactory.DEFAULT_ESTIMATION, RatingFactory.DEFAULT_WEIGHT)]
        return RatingFactory.createAspectsForTopic(balanceSheetType, aspects);
    }

    private static createAspectsForTopicA2(balanceSheetType: BalanceSheetType) {
        const aspects = [
            new PositiveAspectDTOCreate('A2.1', 'Fair business practices towards direct suppliers',
                RatingFactory.DEFAULT_ESTIMATION, RatingFactory.DEFAULT_WEIGHT),
            new PositiveAspectDTOCreate('A2.2', 'Exercising a positive influence on solidarity and social justice in the supply chain',
                RatingFactory.DEFAULT_ESTIMATION, RatingFactory.DEFAULT_WEIGHT)
        ]
        return RatingFactory.createAspectsForTopic(balanceSheetType, aspects);
    }

    private static createAspectsForTopic(balanceSheetType: BalanceSheetType, aspects: PositiveAspectDTOCreate[]) {
        return balanceSheetType === BalanceSheetType.Full ? aspects : [];
    }

}