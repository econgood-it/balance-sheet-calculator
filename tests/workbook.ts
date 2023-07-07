import path from 'path';
import fs from 'fs';
import { WorkbookEntity } from '../src/entities/workbook.entity';

export function workbookEntityFromFile(): WorkbookEntity {
  const workbookPath = path.join(__dirname, 'workbook.json');
  const fileText = fs.readFileSync(workbookPath);
  const jsonParsed = JSON.parse(fileText.toString());
  return new WorkbookEntity(jsonParsed);
}
