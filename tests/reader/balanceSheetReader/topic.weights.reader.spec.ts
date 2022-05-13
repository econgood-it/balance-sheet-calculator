import * as path from 'path';

import { Workbook } from 'exceljs';
import { TopicWeightsReader } from '../../../src/reader/balanceSheetReader/topic.weights.reader';

describe('Topic weights reader', () => {
  const fileDir = path.resolve(__dirname, '../../testData');
  it('should read topic weights from excel', async () => {
    const topicWeightsReader = new TopicWeightsReader();
    const pathToCsv = path.join(fileDir, 'full_5_0_7_unprotected.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);
    const topicWeights = topicWeightsReader.readFromWorkbook(wb);
    expect(topicWeights).toBeDefined();
    expect(topicWeights?.get('A1')).toBe(1);
    expect(topicWeights?.get('A2')).toBe(1);
    expect(topicWeights?.get('A3')).toBe(1);
    expect(topicWeights?.get('A4')).toBe(1);
    expect(topicWeights?.get('B1')).toBe(0.5);
    expect(topicWeights?.get('B2')).toBe(1.5);
    expect(topicWeights?.get('B3')).toBe(1.5);
    expect(topicWeights?.get('B4')).toBe(1);
    expect(topicWeights?.get('C1')).toBe(1);
    expect(topicWeights?.get('C2')).toBe(1);
    expect(topicWeights?.get('C3')).toBe(1.5);
    expect(topicWeights?.get('C4')).toBe(1);
    expect(topicWeights?.get('D1')).toBe(1);
    expect(topicWeights?.get('D2')).toBe(1);
    expect(topicWeights?.get('D3')).toBe(1);
    expect(topicWeights?.get('D4')).toBe(1.5);
    expect(topicWeights?.get('E1')).toBe(1);
    expect(topicWeights?.get('E2')).toBe(1.5);
    expect(topicWeights?.get('E3')).toBe(1);
    expect(topicWeights?.get('E4')).toBe(1);
  });
});
