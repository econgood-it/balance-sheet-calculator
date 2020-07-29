import { Connection, createConnection } from "typeorm";

export class DatabaseConnectionCreator {
    public static async createConnection(): Promise<Connection> {
        if (!process.env.DB_NAME || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.ENTITY_FOLDER) {
            throw Error('Environment variables for the database are not set.');
        }
        return createConnection({
            "type": "postgres",
            "host": "localhost",
            "port": process.env.DB_PORT as unknown as number,
            "username": process.env.DB_USER as string,
            "password": process.env.DB_PASSWORD as string,
            "database": process.env.DB_NAME as string,
            "synchronize": true,
            "logging": true,
            "entities": [
                process.env.ENTITY_FOLDER as string
            ],
            "migrations": [
                "src/migrations/**/*.ts"
            ],
            "subscribers": [
                "src/subscriber/**/*.ts"
            ]
        });
    }

    public static async createConnectionAndRunMigrations(): Promise<Connection> {
        const connection = await DatabaseConnectionCreator.createConnection();
        await connection.runMigrations();
        return connection;
    }
}