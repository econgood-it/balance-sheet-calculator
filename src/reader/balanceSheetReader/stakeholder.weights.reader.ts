import { Workbook } from 'exceljs';
import { CellReader } from './cell.reader';
import { none, Option, some } from '../../calculations/option';
import Provider from '../../providers/provider';

export class StakeholderWeightsReader {
  public readFromWorkbook(wb: Workbook): Option<Provider<string, number>> {
    const cr = new CellReader();
    const weightingSheet = wb.getWorksheet('9. Weighting');

    if (!weightingSheet) {
      return none();
    }

    const column = 'K';

    return some(
      new Provider<string, number>([
        ['A', cr.read(weightingSheet, 49, column).number],
        ['B', cr.read(weightingSheet, 50, column).number],
        ['C', cr.read(weightingSheet, 51, column).number],
        ['D', cr.read(weightingSheet, 52, column).number],
        ['E', cr.read(weightingSheet, 53, column).number],
      ])
    );
  }
}
