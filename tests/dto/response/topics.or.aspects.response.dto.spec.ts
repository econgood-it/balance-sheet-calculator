import { Topic } from '../../../src/entities/topic';
import { TopicOrAspectResponseDTO } from '../../../src/dto/response/topic.or.aspect.dto';
import { Aspect } from '../../../src/entities/aspect';

jest.mock('../../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) => 'Menschenwürde in der Zulieferkette',
}));

describe('TopicsOrAspectsResponseDTO', () => {
  it('is created from topic', async () => {
    const topic = new Topic(
      undefined,
      'A1',
      'v5:compact.A1',
      2,
      3,
      51,
      5,
      true,
      []
    );
    const topicOrAspectResponseDTO = TopicOrAspectResponseDTO.fromTopicOrAspect(
      topic,
      'de'
    );
    expect(topicOrAspectResponseDTO).toBeDefined();
    expect(topicOrAspectResponseDTO).toMatchObject({
      shortName: 'A1',
      name: 'Menschenwürde in der Zulieferkette',
    });
  });

  it('is created from aspect', async () => {
    const aspect = new Aspect(
      undefined,
      'A1.1',
      'v5:compact.A1',
      2,
      3,
      51,
      5,
      true,
      true
    );
    const topicOrAspectResponseDTO = TopicOrAspectResponseDTO.fromTopicOrAspect(
      aspect,
      'de'
    );
    expect(topicOrAspectResponseDTO).toBeDefined();
    expect(topicOrAspectResponseDTO).toMatchObject({
      shortName: 'A1.1',
      name: 'Menschenwürde in der Zulieferkette',
    });
  });
});
