import { MigrationInterface, QueryRunner, Repository } from "typeorm";
import { RegionReader } from "../reader/RegionReader";
import { Region } from "../entities/region";
import { LoggingService } from "../logging";

export class CreateRegionEntries1596038818262 implements MigrationInterface {


    public async up(queryRunner: QueryRunner): Promise<void> {
        const regionReader: RegionReader = new RegionReader();
        const regions: Region[] = await regionReader.read();
        const regionRepository: Repository<Region> = queryRunner.connection.getRepository(Region);

        for (const region of regions) {
            await regionRepository.insert(region);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const regionReader: RegionReader = new RegionReader();
        const regions: Region[] = await regionReader.read();
        const regionRepository: Repository<Region> = queryRunner.connection.getRepository(Region);

        for (const region of regions) {
            await regionRepository.delete({ countryCode: region.countryName });
        }

    }

}
