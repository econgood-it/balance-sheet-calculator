import path from 'path';
import fs from 'fs';
import { makeWorkbook, Workbook } from '../src/models/workbook';

export function workbookFromFile(): Workbook {
  const workbookPath = path.join(__dirname, 'workbook.json');
  const fileText = fs.readFileSync(workbookPath);
  const jsonParsed = JSON.parse(fileText.toString());
  return makeWorkbook.fromJson(jsonParsed);
}
