import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { BalanceSheetController } from './controllers/balanceSheet.controller';
import { Authentication } from './authentication';
import errorMiddleware from './middleware/error.middleware';
import { Connection } from 'typeorm';
import { LoggingService } from './logging';
import { RegionController } from './controllers/region.controller';
import RegionService from './services/region.service';
import { Region } from './entities/region';
import { BalanceSheetService } from './services/balanceSheet.service';
import { BalanceSheet } from './entities/balanceSheet';
import { SupplyFraction } from './entities/supplyFraction';
import { EmployeesFraction } from './entities/employeesFraction';


class App {
  public readonly app: Application;
  //declaring our controllers
  private balanceSheetController: BalanceSheetController;
  private regionController: RegionController;
  private authentication: Authentication;


  constructor(connection: Connection) {
    this.app = express();
    this.authentication = new Authentication();
    this.authentication.addBasicAuthToApplication(this.app);
    this.setConfig();
    //Creating and assigning a new instance of our controller
    const regionService = new RegionService(connection.getRepository(Region));
    const balanceSheetService = new BalanceSheetService(connection.getRepository(BalanceSheet), regionService,
      connection.getRepository(SupplyFraction), connection.getRepository(EmployeesFraction));
    this.regionController = new RegionController(this.app, regionService);
    this.balanceSheetController = new BalanceSheetController(this.app, balanceSheetService);
  }

  public start() {
    this.app.listen(process.env.PORT, () => LoggingService.info(`Listening on port ${process.env.PORT}`))
  }

  private setConfig() {
    //Allows us to receive requests with data in json format
    this.app.use(bodyParser.json({ limit: '50mb' }));

    //Allows us to receive requests with data in x-www-form-urlencoded format
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(errorMiddleware);

    //Enables cors   
    this.app.use(cors());
  }
}

export default App;