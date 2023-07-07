import { workbookEntityFromFile } from '../workbook';

describe('WorkbookEntity', () => {
  it('should be created from json', function () {
    const workbookEntity = workbookEntityFromFile();
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
});
