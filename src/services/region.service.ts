import { Region } from "../entities/region";

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

    public getRegion(countryCode: string): Region | undefined {
        return this.regions.get(countryCode);
    }
}