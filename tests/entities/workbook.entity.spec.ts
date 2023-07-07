import { WorkbookEntity } from '../../src/entities/workbook.entity';
import path from 'path';
import fs from 'fs';

describe('WorkbookEntity', () => {
  it('should return section by shortName', function () {
    const c2Section = { shortName: 'C2', title: 'C2 title' };
    const workbookEntity = new WorkbookEntity([
      { shortName: 'A1', title: 'A1 title' },
      { shortName: 'D1', title: 'D1 title' },
      c2Section,
    ]);
    expect(workbookEntity.findByShortName('C2')).toEqual(c2Section);
  });

  it('should be created from json', function () {
    const workbookPath = path.join(__dirname, 'workbook.json');
    const fileText = fs.readFileSync(workbookPath);
    const jsonParsed = JSON.parse(fileText.toString());
    const workbookEntity = WorkbookEntity.fromJson(jsonParsed);
    expect(workbookEntity.findByShortName('C')).toEqual({
      shortName: 'C',
      title: 'C. Employees, including co-working employers',
    });
    expect(workbookEntity.findByShortName('C1')).toEqual({
      shortName: 'C1',
      title: 'C1 Human dignity in the workplace and working environment ',
    });
    expect(workbookEntity.findByShortName('C1.3')).toEqual({
      shortName: 'C1.3',
      title: 'C1.3 Diversity and equal opportunities',
    });
  });

  it('should return json', function () {
    const sections = [
      { shortName: 'A1', title: 'A1 title' },
      { shortName: 'D1', title: 'D1 title' },
      { shortName: 'C2', title: 'C2 title' },
    ];
    const workbookEntity = new WorkbookEntity(sections);

    const json = workbookEntity.toJson();
    expect(json).toEqual({ sections });
  });
});
