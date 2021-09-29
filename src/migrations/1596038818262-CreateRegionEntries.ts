import { MigrationInterface, QueryRunner, Repository } from 'typeorm';
import { RegionReader } from '../reader/region.reader';
import { Region } from '../entities/region';
import path from 'path';

export class CreateRegionEntries1596038818262 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const regionReader: RegionReader = new RegionReader();
    const pathToCsv = path.join(
      path.resolve(__dirname, '../files/reader'),
      'regions_5_0_4.csv'
    );
    const regions: Region[] = await regionReader.read(pathToCsv);
    const regionRepository: Repository<Region> =
      queryRunner.connection.getRepository(Region);

    for (const region of regions) {
      await regionRepository.insert(region);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const regionReader: RegionReader = new RegionReader();
    const pathToCsv = path.join(
      path.resolve(__dirname, '../files/reader'),
      'regions_5_0_4.csv'
    );
    const regions: Region[] = await regionReader.read(pathToCsv);
    const regionRepository: Repository<Region> =
      queryRunner.connection.getRepository(Region);

    for (const region of regions) {
      await regionRepository.delete({ countryCode: region.countryName });
    }
  }
}
