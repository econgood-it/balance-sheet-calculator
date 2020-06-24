import { Region } from "../entities/region";
import { LoggingService } from "../logging";
import { Request, Response } from "express";
import { Database } from "../database";

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

    public async initializeRegions(req: Request, res: Response) {

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