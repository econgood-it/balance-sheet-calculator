import {MatrixTopicDTO} from "../../../src/dto/matrix/matrix.topic.dto";
import {Topic} from "../../../src/entities/topic";


describe('Matrix Topic DTO', () => {
  let topic: Topic;

  beforeEach(() => {
    topic = new Topic(undefined, 'A1', 'A1 name', 0, 0,0, 0,
      false, []);
  })

  it('is created from topic',   () => {
    const matrixTopicDTO = MatrixTopicDTO.fromTopic(topic);
    expect(matrixTopicDTO).toBeDefined();
  })

  it('has reached points are 30 of 50',  () => {
    topic.points = 30;
    topic.maxPoints = 50;
    const matrixTopicDTO = MatrixTopicDTO.fromTopic(topic);
    expect(matrixTopicDTO.pointsReached).toBe('30 of 50');
  })

  it('has reached points are -100 of 60',  () => {
    topic.points = -100;
    topic.maxPoints = 60;
    const matrixTopicDTO = MatrixTopicDTO.fromTopic(topic);
    expect(matrixTopicDTO.pointsReached).toBe('-100 of 60');
  })

  it('has reached 100%',  () => {
    topic.points = 50;
    topic.maxPoints = 50;
    const matrixTopicDTO = MatrixTopicDTO.fromTopic(topic);
    expect(matrixTopicDTO.percentageReached).toBe('100 %');
  })

  it('has reached 0%',  () => {
    topic.points = 0;
    topic.maxPoints = 50;
    const matrixTopicDTO = MatrixTopicDTO.fromTopic(topic);
    expect(matrixTopicDTO.percentageReached).toBe('0 %');
  })

  it('has reached 0% when division by 0',  () => {
    topic.points = 10;
    topic.maxPoints = 0;
    const matrixTopicDTO = MatrixTopicDTO.fromTopic(topic);
    expect(matrixTopicDTO.percentageReached).toBe('0 %');
  })

  it('has reached 17% (rounded)',  () => {
    topic.points = 10;
    topic.maxPoints = 60;
    const matrixTopicDTO = MatrixTopicDTO.fromTopic(topic);
    expect(matrixTopicDTO.percentageReached).toBe('17 %');
  })

  it('has unvalid percentage',  () => {
    topic.points = -10;
    topic.maxPoints = 60;
    const matrixTopicDTO = MatrixTopicDTO.fromTopic(topic);
    expect(matrixTopicDTO.percentageReached).toBe('');
  })

  it('has shortName A1',  () => {
    const matrixTopicDTO = MatrixTopicDTO.fromTopic(topic);
    expect(matrixTopicDTO.shortName).toBe('A1');
  })

  it('has name A1 name',  () => {
    const matrixTopicDTO = MatrixTopicDTO.fromTopic(topic);
    expect(matrixTopicDTO.name).toBe('A1 name');
  })


})