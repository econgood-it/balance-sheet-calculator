import { MigrationInterface, QueryRunner, Repository } from 'typeorm';
import { IndustryReader } from '../reader/industry.reader';
import { Industry } from '../entities/industry';
import path from 'path';

export class CreateIndustryEntries1596038818263 implements MigrationInterface {
  readonly PATH_TO_CSV = path.join(
    path.resolve(__dirname, '../files/reader'),
    'industry.csv'
  );

  public async up(queryRunner: QueryRunner): Promise<void> {
    const industryReader: IndustryReader = new IndustryReader();

    const industries: Industry[] = await industryReader.read(this.PATH_TO_CSV);

    for (const industry of industries) {
      const insertQuery = `INSERT INTO "industry" ("industryCode", "ecologicalSupplyChainRisk", "ecologicalDesignOfProductsAndServices") VALUES ($1, $2, $3);`;
      await queryRunner.query(insertQuery, [
        industry.industryCode,
        industry.ecologicalSupplyChainRisk,
        industry.ecologicalDesignOfProductsAndServices,
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const industryReader: IndustryReader = new IndustryReader();
    const industries: Industry[] = await industryReader.read(this.PATH_TO_CSV);
    const industryRepository: Repository<Industry> =
      queryRunner.connection.getRepository(Industry);
    for (const industry of industries) {
      await industryRepository.delete({ industryCode: industry.industryCode });
    }
  }
}
