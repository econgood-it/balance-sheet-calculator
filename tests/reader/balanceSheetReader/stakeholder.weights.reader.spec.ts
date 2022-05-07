import * as path from 'path';

import { Workbook } from 'exceljs';
import { StakeholderWeightsReader } from '../../../src/reader/balanceSheetReader/stakeholder.weights.reader';
import Provider from '../../../src/providers/provider';

describe('Stakeholder weights reader', () => {
  it('should read stakeholder weights from excel', async () => {
    const stakeholderWeightsReader = new StakeholderWeightsReader();
    const pathToCsv = path.join(__dirname, 'full_5_0_7_unprotected.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);
    const optionalStakeholderWeights =
      stakeholderWeightsReader.readFromWorkbook(wb);
    expect(optionalStakeholderWeights.isPresent()).toBeTruthy();
    const stakeholderWeights = optionalStakeholderWeights.get() as Provider<
      string,
      number
    >;
    expect(stakeholderWeights.get('A')).toBe(1);
    expect(stakeholderWeights.get('B')).toBe(0.5);
    expect(stakeholderWeights.get('C')).toBe(2);
    expect(stakeholderWeights.get('D')).toBe(1);
    expect(stakeholderWeights.get('E')).toBe(1);
  });
});
