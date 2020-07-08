import { Region } from "../entities/region";
import { LoggingService } from "../logging";
import { Request, Response, NextFunction } from "express";
import { RegionReader } from "../reader/RegionReader";
import InternalServerException from "../exceptions/InternalServerException";
import { Repository } from "typeorm";

export class RegionService {

    private regions: Map<string, Region>;
    private regionRepository: Repository<Region>;

    constructor(regionRepository: Repository<Region>) {
        this.regionRepository = regionRepository;
        const arabEmiratesCode = "ARE";
        const afghanistanCode = "AFG";
        this.regions = new Map([
            [arabEmiratesCode, new Region(2.050108031355940, arabEmiratesCode, "United Arab Emirates")],
            [afghanistanCode, new Region(3.776326416513620, afghanistanCode, "Afghanistan")],
        ]);
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
        console.log(this);
        try {
            const region = Region.fromJSON(req.body);
            const regionEntity = await this.regionRepository.save(region);
            res.json(regionEntity);
        } catch (error) {
            next(new InternalServerException(error));
        }

    }

    public getRegion(countryCode: string): Region | undefined {
        return this.regions.get(countryCode);
    }
}


export default RegionService;