import { RegionReader } from "../src/reader/RegionReader";
import { Region } from "../src/entities/region";
import app from "../src/app";
import supertest from "supertest";
import { Database } from "../src/database";
describe('Main Controller', () => {
    it('should initialize regions', async (done) => {
        const testApp = supertest(app);
        await testApp.post('/regions/initialize').auth(process.env.USERNAME as string,
            process.env.PASSWORD as string).send();
        // await Database.getRegionRepository().clear();
        done();
    })
})