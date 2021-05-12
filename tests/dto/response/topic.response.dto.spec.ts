import { Topic } from '../../../src/entities/topic';
import { TopicDTOResponse } from '../../../src/dto/response/topic.response.dto';

jest.mock('../../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) => 'Menschenwürde in der Zulieferkette',
}));

describe('TopicResponseDTO', () => {
  it('is created from topic', async (done) => {
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
    const topicResponseDTO = TopicDTOResponse.fromTopic(topic, 'de');
    expect(topicResponseDTO).toBeDefined();
    expect(topicResponseDTO.name).toBe('Menschenwürde in der Zulieferkette');
    done();
  });
});
