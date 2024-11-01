import path from 'path';
import fs from 'fs';
import { makeWorkbookOld, WorkbookOld } from '../src/models/workbookOld';

export function workbookFromFile(): WorkbookOld {
  const workbookPath = path.join(__dirname, 'workbook.json');
  const fileText = fs.readFileSync(workbookPath);
  const jsonParsed = JSON.parse(fileText.toString());
  return makeWorkbookOld.fromJson(jsonParsed);
}
