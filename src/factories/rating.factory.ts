import { TopicDTOCreate } from "../dto/create/topicCreate.dto";
import { RatingDTOCreate } from "../dto/create/ratingCreate.dto";

export class RatingFactory {

    public static createDefaultRating(): RatingDTOCreate {
        const defaultWeight = 1;
        const defaultEstimation = 0;
        return new RatingDTOCreate([
            new TopicDTOCreate('A1', 'Human dignity in the supply chain', defaultEstimation, defaultWeight),
            new TopicDTOCreate('A2', 'Solidarity and social justice in the supply chain', defaultEstimation, defaultWeight),
            new TopicDTOCreate('A3', 'Environmental sustainability in the supply chain', defaultEstimation, defaultWeight),
            new TopicDTOCreate('A4', 'Transparency & co-determination in the supply chain', defaultEstimation, defaultWeight),
            new TopicDTOCreate('B1', 'Ethical position in relation to financial resources', defaultEstimation, defaultWeight),
            new TopicDTOCreate('B2', 'Social position in relation to financial resources', defaultEstimation, defaultWeight),
            new TopicDTOCreate('B3', 'Use of funds in relation to social and environmental impacts', defaultEstimation, defaultWeight),
            new TopicDTOCreate('B4', 'Ownership and co-determination', defaultEstimation, defaultWeight),
            new TopicDTOCreate('C1', 'Human dignity in the workplace and working environment', defaultEstimation, defaultWeight),
            new TopicDTOCreate('C2', 'Self-determined working arrangements', defaultEstimation, defaultWeight),
            new TopicDTOCreate('C3', 'Environmentally-friendly behaviour of staff', defaultEstimation, defaultWeight),
            new TopicDTOCreate('C4', 'Co-determination and transparency within the organisation', defaultEstimation, defaultWeight),
            new TopicDTOCreate('D1', 'Ethical customer relations', defaultEstimation, defaultWeight),
            new TopicDTOCreate('D2', 'Cooperation and solidarity with other companies', defaultEstimation, defaultWeight),
            new TopicDTOCreate('D3', 'Impact on the environment of the use and disposal of products and services', defaultEstimation, defaultWeight),
            new TopicDTOCreate('D4', 'Customer participation and product transparency', defaultEstimation, defaultWeight),
            new TopicDTOCreate('E1', 'Purpose of products and services and their effects on society', defaultEstimation, defaultWeight),
            new TopicDTOCreate('E2', 'Contribution to the community', defaultEstimation, defaultWeight),
            new TopicDTOCreate('E3', 'Reduction of environmental impact', defaultEstimation, defaultWeight),
            new TopicDTOCreate('E4', 'Social co-determination and transparency', defaultEstimation, defaultWeight),
        ])
    }
}