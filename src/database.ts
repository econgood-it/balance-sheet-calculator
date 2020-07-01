import { Connection, Repository } from "typeorm";
import { Region } from "./entities/region";
import { createConnection } from "typeorm";
import { LoggingService } from "./logging";

export class Database {
    public static connection: Connection;
    public static async connect(): Promise<void> {
        if (!process.env.DB_NAME || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.ENTITY_FOLDER) {
            throw Error('Environment variables for the database are not set.');
        }
        LoggingService.info(process.cwd());

        Database.connection = await createConnection({
            "type": "postgres",
            "host": "localhost",
            "port": process.env.DB_PORT as unknown as number,
            "username": process.env.DB_USER as string,
            "password": process.env.DB_PASSWORD as string,
            "database": process.env.DB_NAME as string,
            "synchronize": true,
            "logging": false,
            "entities": [
                process.env.ENTITY_FOLDER as string
            ],
            "migrations": [
                "src/migration/**/*.ts"
            ],
            "subscribers": [
                "src/subscriber/**/*.ts"
            ]
        });
    }
    public static getRegionRepository(): Repository<Region> {
        return Database.connection.getRepository(Region);
    }
}