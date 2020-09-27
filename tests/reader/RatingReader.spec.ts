
import * as path from 'path';
import { TopicDTOCreate } from '../../src/dto/create/topicCreate.dto';
import { Topic } from '../../src/entities/topic';
import { RatingReader } from '../../src/reader/RatingReader';

describe('Rating Reader', () => {
    it('should read rating from csv', async (done) => {
        const ratingReader = new RatingReader();
        const pathToCsv = path.join(__dirname, "rating.csv");
        const topics: Topic[] = await (await ratingReader.readRatingFromCsv(pathToCsv)).topics;
        // Topic	A1	Human dignity in the supply chain	1	0 %	0	83
        expect(topics[0]).toMatchObject(
            {
                "id": undefined, "shortName": 'A1', "name": 'Human dignity in the supply chain', 'weight': 0,
                'isWeightSelectedByUser': false, 'estimations': 4, "points": 20.4, "maxPoints": 51,
                'aspects': [{
                    'id': undefined, 'shortName': 'A1.1',
                    "name": 'Working conditions and social impact in the supply chain', 'weight': 0,
                    'isWeightSelectedByUser': false, 'estimations': 2, "points": 10.2, "maxPoints": 51,
                    'isPositive': true
                },
                {
                    'id': undefined, 'shortName': 'A1.2',
                    "name": 'Negative aspect: violation of human dignity in the supply chain', 'weight': 0,
                    'isWeightSelectedByUser': false, 'estimations': -3, "points": -30.4, "maxPoints": -170.212765957447,
                    'isPositive': false
                }
                ]
            });
        expect(topics[2]).toMatchObject(
            {
                "id": undefined, "shortName": 'A3', "name": 'Environmental sustainability in the supply chain',
                'weight': 2, 'isWeightSelectedByUser': true, 'estimations': 5, "points": 50, "maxPoints": 100,
                'aspects': [{
                    'id': undefined, 'shortName': 'A3.1',
                    "name": 'Environmental impact throughout the supply chain', 'weight': 1.5,
                    'isWeightSelectedByUser': true, 'estimations': 7, "points": 30, "maxPoints": 51,
                    'isPositive': true
                },
                {
                    'id': undefined, 'shortName': 'A3.2',
                    "name": 'Negative aspect: disproportionate environmental impact throughout the supply chain',
                    'weight': 0, 'isWeightSelectedByUser': false, 'estimations': -5, "points": -150,
                    "maxPoints": -200, 'isPositive': false
                }
                ]
            });
        done();
    })


    it('should read ratingDTOCreate from csv', async (done) => {
        const ratingReader = new RatingReader();
        const pathToCsv = path.join(__dirname, "rating.csv");
        const topics: TopicDTOCreate[] = await (await ratingReader.readRatingDTOFromCsv(pathToCsv)).topics;
        // Topic	A1	Human dignity in the supply chain	1	0 %	0	83
        expect(topics[0]).toMatchObject(
            {
                "shortName": 'A1', "name": 'Human dignity in the supply chain', 'weight': undefined,
                'isWeightSelectedByUser': false, 'estimations': 4,
                'aspects': [{
                    'shortName': 'A1.1',
                    "name": 'Working conditions and social impact in the supply chain', 'weight': undefined,
                    'isWeightSelectedByUser': false, 'estimations': 2,
                    'isPositive': true
                },
                {
                    'shortName': 'A1.2',
                    "name": 'Negative aspect: violation of human dignity in the supply chain', 'weight': undefined,
                    'isWeightSelectedByUser': false, 'estimations': -3,
                    'isPositive': false
                }
                ]
            });
        expect(topics[2]).toMatchObject(
            {
                "shortName": 'A3', "name": 'Environmental sustainability in the supply chain',
                'weight': 2, 'isWeightSelectedByUser': true, 'estimations': 5,
                'aspects': [{
                    'shortName': 'A3.1',
                    "name": 'Environmental impact throughout the supply chain', 'weight': 1.5,
                    'isWeightSelectedByUser': true, 'estimations': 7,
                    'isPositive': true
                },
                {
                    'shortName': 'A3.2',
                    "name": 'Negative aspect: disproportionate environmental impact throughout the supply chain',
                    'weight': undefined, 'isWeightSelectedByUser': false, 'estimations': -5, 'isPositive': false
                }
                ]
            });
        done();
    })


})