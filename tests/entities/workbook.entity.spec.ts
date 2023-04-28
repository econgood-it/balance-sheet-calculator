import { WorkbookEntity } from '../../src/entities/workbook.entity';

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
