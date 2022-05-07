import { Workbook } from 'exceljs';
import { CellReader } from './cell.reader';
import Provider from '../../providers/provider';

export class TopicWeightsReader {
  private cr = new CellReader();
  public readFromWorkbook(wb: Workbook): Provider<string, number> | undefined {
    const weightingSheet = wb.getWorksheet('9. Weighting');

    if (!weightingSheet) {
      return undefined;
    }

    const topicWeights = new Provider<string, number>();
    for (const [rowIndex, stakeholderName] of [
      [16, 'A'],
      [24, 'B'],
      [30, 'C'],
      [37, 'D'],
      [43, 'E'],
    ] as const) {
      for (const [index, column] of ['M', 'N', 'O', 'P'].entries()) {
        topicWeights.set(
          `${stakeholderName}${index + 1}`,
          this.cr.read(weightingSheet, rowIndex, column).number
        );
      }
    }

    return topicWeights;
  }
}
