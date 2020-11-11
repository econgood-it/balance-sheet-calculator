import { Connection, createConnection } from "typeorm";
import { Configuration } from "./configuration.reader";

enum Environment {
    dev, prod
}

export class DatabaseConnectionCreator {
    public static async createConnection(configuration: Configuration): Promise<Connection> {


        return createConnection({
            "type": "postgres",
            "host": "localhost",
            "port": configuration.dbPort,
            "username": configuration.dbUser,
            "password": configuration.dbPassword,
            "database": configuration.dbName,
            "synchronize": false,
            "logging": false,
            "entities": [
                configuration.entityRegex
            ],
            "migrations": [
                configuration.migrationRegex
            ],
        });
    }

    public static async createConnectionAndRunMigrations(configuration: Configuration): Promise<Connection> {
        const connection = await DatabaseConnectionCreator.createConnection(configuration);
        await connection.runMigrations({ transaction: 'each' });
        return connection;
    }
}