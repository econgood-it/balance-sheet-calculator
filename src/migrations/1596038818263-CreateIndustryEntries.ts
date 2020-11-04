import { MigrationInterface, QueryRunner, Repository } from "typeorm";
import { RegionReader } from "../reader/region.reader";
import { Region } from "../entities/region";
import {IndustryReader} from "../reader/industry.reader";
import {Industry} from "../entities/industry";

export class CreateIndustryEntries1596038818263 implements MigrationInterface {


    public async up(queryRunner: QueryRunner): Promise<void> {
        const industryReader: IndustryReader = new IndustryReader();
        const industries: Industry[] = await industryReader.read();
        const industryRepository: Repository<Industry> = queryRunner.connection.getRepository(Industry);

        for (const industry of industries) {
            await industryRepository.insert(industry);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const industryReader: IndustryReader = new IndustryReader();
        const industries: Industry[] = await industryReader.read();
        const industryRepository: Repository<Industry> = queryRunner.connection.getRepository(Industry);
        for (const industry of industries) {
            await industryRepository.delete({ industryCode: industry.industryCode });
        }
    }

}
