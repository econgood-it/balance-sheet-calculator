
import app from "./app";
import "reflect-metadata";
import { Database } from "./database";

Database.connect().then(() => {
    app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));
}).catch(error => console.log(error));