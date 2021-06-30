import { TopicOrAspectDTO } from '../../../src/dto/createAndUpdate/topic.or.aspect.dto';

describe('TopicOrAspectCreateDTO', () => {
  it('is created from json and is classified as aspect', () => {
    const json = {
      shortName: 'A1.1',
      estimations: 5,
      weight: 1,
    };
    const topicOrAspectDTOCreate: TopicOrAspectDTO =
      TopicOrAspectDTO.fromJSON(json);
    expect(topicOrAspectDTOCreate).toMatchObject({ ...json, isAspect: true });
  });

  it('is created from json and is classified as topic', () => {
    const json = {
      shortName: 'A1',
      estimations: 5,
      weight: 1,
    };
    const topicOrAspectDTOCreate: TopicOrAspectDTO =
      TopicOrAspectDTO.fromJSON(json);
    expect(topicOrAspectDTOCreate).toMatchObject({ ...json, isAspect: false });
  });
});
