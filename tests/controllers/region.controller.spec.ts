
import supertest from "supertest";
import { Connection } from "typeorm";
import { DatabaseConnectionCreator } from '../../src/DatabaseConnectionCreator';
import App from '../../src/app';
import { Application } from "express";



describe('Region Controller', () => {
    let connection: Connection;
    let app: Application;
    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnection();
        app = new App(connection).app;
        done();
    })

    afterAll(async (done) => {
        connection.close();
        done();
    })


    it('should initialize regions', async (done) => {
        const testApp = supertest(app);
        const response = await testApp.post('/regions/initialize').auth(process.env.USERNAME as string,
            process.env.PASSWORD as string).send();
        expect(response.status).toEqual(200);
        done();
    })
})