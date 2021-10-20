import { MigrationInterface, QueryRunner, Repository } from 'typeorm';
import { RegionReader } from '../reader/region.reader';
import { Region } from '../entities/region';
import path from 'path';
import { BalanceSheetVersion } from '../entities/enums';

export class CreateRegionEntries5051633512425847 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const regionReader: RegionReader = new RegionReader();
    const pathToCsv = path.join(
      path.resolve(__dirname, '../files/reader'),
      'regions_5_0_5.csv'
    );
    const regions: Region[] = await regionReader.read(
      pathToCsv,
      [22, 243],
      BalanceSheetVersion.v5_0_5
    );
    for (const region of regions) {
      const insertQuery = `INSERT INTO "region" ("countryCode", "pppIndex","countryName","ituc", "validFromVersion") VALUES ($1, $2, $3, $4, $5);`;
      await queryRunner.query(insertQuery, [
        region.countryCode,
        region.pppIndex,
        region.countryName,
        region.ituc,
        region.validFromVersion,
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const regionReader: RegionReader = new RegionReader();
    const pathToCsv = path.join(
      path.resolve(__dirname, '../files/reader'),
      'regions_5_0_5.csv'
    );
    const regions: Region[] = await regionReader.read(
      pathToCsv,
      [22, 242],
      BalanceSheetVersion.v5_0_5
    );
    const regionRepository: Repository<Region> =
      queryRunner.connection.getRepository(Region);

    for (const region of regions) {
      await regionRepository.delete({
        countryCode: region.countryName,
        validFromVersion: region.validFromVersion,
      });
    }
  }
}
