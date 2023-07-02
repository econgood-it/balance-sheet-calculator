import { Workbook } from 'exceljs';
import { CellReader } from './cell.reader';
import Provider from '../../providers/provider';
import { StakeholderWeight } from '../../models/stakeholder.weight';

export class StakeholderWeightsReader {
  public readFromWorkbook(wb: Workbook): Provider<string, number> | undefined {
    return this.read(wb, 'R');
  }

  public readUserSelectedFromWorkbook(wb: Workbook): StakeholderWeight[] {
    const mergedWeights = this.readFromWorkbook(wb);
    const calculatedWeights = this.read(wb, 'K');
    const customWeights: StakeholderWeight[] = [];
    for (const [shortName, weight] of mergedWeights!.entries()) {
      if (calculatedWeights!.get(shortName) !== weight) {
        customWeights.push({ shortName, weight });
      }
    }
    return customWeights;
  }

  private read(wb: Workbook, column: string) {
    const cr = new CellReader();
    const weightingSheet = wb.getWorksheet('9. Weighting');

    if (!weightingSheet) {
      return undefined;
    }

    return new Provider<string, number>([
      ['A', cr.read(weightingSheet, 49, column).numberWithDefault0],
      ['B', cr.read(weightingSheet, 50, column).numberWithDefault0],
      ['C', cr.read(weightingSheet, 51, column).numberWithDefault0],
      ['D', cr.read(weightingSheet, 52, column).numberWithDefault0],
      ['E', cr.read(weightingSheet, 53, column).numberWithDefault0],
    ]);
  }
}
