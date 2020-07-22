
import "reflect-metadata";
import { DatabaseConnectionCreator } from "./DatabaseConnectionCreator";
import { Connection } from "typeorm";
import App from "./app";
import { LoggingService } from "./logging";


DatabaseConnectionCreator.createConnection().then(async (connection: Connection) => {

    // const rating = new Rating([new Topic('A1', 'A1 name', 0, 3, 10, 51)]);
    // const ratingRepo = connection.getRepository(Rating);
    // await ratingRepo.save(rating);
    // const ratings: Rating[] = await ratingRepo.find({ relations: ["topics"] });
    // for (const rating1 of ratings) {
    //     console.log(rating1.topics[0].rating);
    // }
    const app = new App(connection);
    app.start();
    //connection.runMigrations().then(() => { app.start(); }).catch(error => LoggingService.error(error));
}).catch(error => LoggingService.error(error));