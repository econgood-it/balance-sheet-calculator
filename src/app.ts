import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { BalanceSheetController } from './controllers/balance.sheet.controller';
import { Authentication } from './authentication';
import errorMiddleware from './middleware/error.middleware';
import { Connection } from 'typeorm';
import { LoggingService } from './logging';
import { BalanceSheetService } from './services/balance.sheet.service';
import { ConfigurationReader, Configuration } from './configuration.reader';
import {UserController} from "./controllers/user.controller";
import {UserService} from "./services/user.service";


class App {
  public readonly app: Application;
  //declaring our controllers
  private balanceSheetController: BalanceSheetController;
  private userController: UserController;
  private authentication: Authentication;


  constructor(connection: Connection, private configuration: Configuration) {
    this.app = express();
    this.setupCorsAndErrorMiddleware();
    this.authentication = new Authentication();
    this.authentication.addJwtAuthToApplication(this.app, configuration.jwtSecret);
    // Creating controllers
    const balanceSheetService = new BalanceSheetService(connection);
    this.balanceSheetController = new BalanceSheetController(this.app, balanceSheetService);
    const userService = new UserService(connection, configuration.jwtSecret);
    this.userController = new UserController(this.app, userService);
  }

  public start() {
    this.app.listen(this.configuration.appPort, () => LoggingService.info(`Listening on port ${this.configuration.appPort}`))
  }


  private setupCorsAndErrorMiddleware() {
    this.app.use(cors());
    //Allows us to receive requests with data in json format
    this.app.use(bodyParser.json({ limit: '50mb' }));
    //Allows us to receive requests with data in x-www-form-urlencoded format
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(errorMiddleware);
  }
}

export default App;