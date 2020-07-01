import { Region } from "../entities/region";
import { LoggingService } from "../logging";
import { Request, Response, NextFunction } from "express";
import { Database } from "../database";
import { RegionReader } from "../reader/RegionReader";
import InternalServerException from "../exceptions/InternalServerException";
import { Repository } from "typeorm";
import { getRepository } from "typeorm";

export class RegionService {

    private regions: Map<string, Region>;

    constructor() {
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
                await Database.getRegionRepository().save(region);
            }
            res.json(regions);
        } catch (error) {
            next(new InternalServerException(error));
        }

    }


    public async createRegion(req: Request, res: Response) {
        LoggingService.info('Create region');
        const region = Region.fromJSON(req.body);
        const regionEntity = await Database.getRegionRepository().save(region);
        res.json(regionEntity);
    }

    public getRegion(countryCode: string): Region | undefined {
        return this.regions.get(countryCode);
    }
}