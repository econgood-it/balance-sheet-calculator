import { Workbook } from 'exceljs';
import { CellReader } from './cell.reader';
import Provider from '../../providers/provider';

export class StakeholderWeightsReader {
  public readFromWorkbook(wb: Workbook): Provider<string, number> | undefined {
    const cr = new CellReader();
    const weightingSheet = wb.getWorksheet('9. Weighting');

    if (!weightingSheet) {
      return undefined;
    }

    const column = 'K';

    return new Provider<string, number>([
      ['A', cr.read(weightingSheet, 49, column).number],
      ['B', cr.read(weightingSheet, 50, column).number],
      ['C', cr.read(weightingSheet, 51, column).number],
      ['D', cr.read(weightingSheet, 52, column).number],
      ['E', cr.read(weightingSheet, 53, column).number],
    ]);
  }
}
