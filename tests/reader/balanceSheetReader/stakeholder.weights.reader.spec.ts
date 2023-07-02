import * as path from 'path';

import { Workbook } from 'exceljs';
import { StakeholderWeightsReader } from '../../../src/reader/balanceSheetReader/stakeholder.weights.reader';

describe('Stakeholder weights reader', () => {
  const pathToExcel = path.join(
    __dirname,
    'full_5_0_8_custom_stakeholder_weights.xlsx'
  );
  const stakeholderWeightsReader = new StakeholderWeightsReader();
  it('should read stakeholder weights from excel', async () => {
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToExcel);
    const stakeholderWeights = stakeholderWeightsReader.readFromWorkbook(wb);
    expect(stakeholderWeights).toBeDefined();
    expect(stakeholderWeights?.get('A')).toBe(1);
    expect(stakeholderWeights?.get('B')).toBe(0.5);
    expect(stakeholderWeights?.get('C')).toBe(2);
    expect(stakeholderWeights?.get('D')).toBe(0);
    expect(stakeholderWeights?.get('E')).toBe(1);
  });

  it('should read custom stakeholder weights from excel', async () => {
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToExcel);
    const stakeholderWeights =
      stakeholderWeightsReader.readUserSelectedFromWorkbook(wb);
    expect(stakeholderWeights).toEqual([
      { shortName: 'A', weight: 1 },
      { shortName: 'B', weight: 0.5 },
      { shortName: 'C', weight: 2 },
      { shortName: 'D', weight: 0 },
    ]);
  });
});
