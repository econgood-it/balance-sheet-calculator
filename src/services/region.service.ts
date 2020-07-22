import { Region } from "../entities/region";
import { LoggingService } from "../logging";
import { Request, Response, NextFunction } from "express";
import { RegionReader } from "../reader/RegionReader";
import InternalServerException from "../exceptions/InternalServerException";
import { Repository } from "typeorm";
import { RegionDTOCreate } from "../dto/create/regionCreate.dto";

export class RegionService {

    private regionRepository: Repository<Region>;

    constructor(regionRepository: Repository<Region>) {
        this.regionRepository = regionRepository;
    }

    public async initializeRegions(req: Request, res: Response, next: NextFunction) {
        LoggingService.info('Initialize regions');
        const regionReader: RegionReader = new RegionReader();
        try {
            const regions: Region[] = await regionReader.read('./ecg-excel.xlsx');
            for (const region of regions) {
                await this.regionRepository.save(region);
            }
            res.json(regions);
        } catch (error) {
            next(new InternalServerException(error));
        }

    }


    public async createRegion(req: Request, res: Response, next: NextFunction) {
        LoggingService.info('Create region');
        try {
            const region: RegionDTOCreate = RegionDTOCreate.fromJSON(req.body);
            const regionEntity: Region = await this.regionRepository.save(region);
            res.json(regionEntity);
        } catch (error) {
            next(new InternalServerException(error));
        }

    }

    public getRegion(countryCode: string): Promise<Region> {
        return this.regionRepository.findOneOrFail({ countryCode: countryCode });
    }
}


export default RegionService;