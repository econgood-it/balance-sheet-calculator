import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Application } from 'express';
import { BalanceSheetController } from './controllers/balance.sheet.controller';
import errorMiddleware from './middleware/error.middleware';
import {
  Authentication,
  IAuthenticationProvider,
} from './security/authentication';

import { DataSource } from 'typeorm';
import { DocsController } from './controllers/docs.controller';
import { HealthCheckController } from './controllers/health.check.controller';
import { IndustryController } from './controllers/industry.controller';
import { OrganizationController } from './controllers/organization.controller';
import { RegionController } from './controllers/region.controller';
import { WorkbookController } from './controllers/workbook.controller';
import { LoggingService } from './logging';
import correlationIdMiddleware from './middleware/correlation.id.middleware';
import morganMiddleware from './middleware/morgan.http.logging.middleware';
import { Configuration } from './reader/configuration.reader';
import { IRepoProvider } from './repositories/repo.provider';
import { BalanceSheetService } from './services/balance.sheet.service';
import { HealthCheckService } from './services/health.check.service';
import { IndustryService } from './services/industry.service';
import { OrganizationService } from './services/organization.service';
import { RegionService } from './services/region.service';
import { WorkbookService } from './services/workbook.service';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

class App {
  public readonly app: Application;
  // declaring our controllers
  private balanceSheetController: BalanceSheetController;
  private userController: UserController;
  private regionController: RegionController;
  private industryController: IndustryController;
  private healthCheckController: HealthCheckController;
  private organizationController: OrganizationController;
  private docsController: DocsController;
  private authentication: Authentication;
  private workbookController: WorkbookController;

  constructor(
    dataSource: DataSource,
    private configuration: Configuration,
    repoProvider: IRepoProvider,
    authProvider: IAuthenticationProvider
  ) {
    this.app = express();
    this.app.use(morganMiddleware);

    this.setConfig();

    this.authentication = new Authentication(authProvider);
    this.authentication.addBasicAuthToDocsEndpoint(this.app, configuration);
    this.authentication.addAuthToApplication(this.app);
    // Creating controllers
    const balanceSheetService = new BalanceSheetService(
      dataSource,
      repoProvider
    );
    this.balanceSheetController = new BalanceSheetController(
      this.app,
      balanceSheetService
    );
    const userService = new UserService(dataSource, repoProvider);
    this.userController = new UserController(this.app, userService);

    const regionService = new RegionService();
    this.regionController = new RegionController(this.app, regionService);
    this.industryController = new IndustryController(
      this.app,
      new IndustryService()
    );
    this.workbookController = new WorkbookController(
      this.app,
      new WorkbookService(repoProvider)
    );
    this.healthCheckController = new HealthCheckController(
      this.app,
      new HealthCheckService()
    );
    this.organizationController = new OrganizationController(
      this.app,
      new OrganizationService(dataSource, repoProvider)
    );
    this.docsController = new DocsController(this.app, configuration);
    this.app.use(errorMiddleware);
  }

  public start() {
    this.app.listen(this.configuration.appPort, () =>
      LoggingService.info(`Listening on port ${this.configuration.appPort}`)
    );
  }

  private setConfig() {
    this.app.use(cors());
    // Allows us to receive requests with data in json format
    this.app.use(bodyParser.json({ limit: '50mb' }));

    // Allows us to receive requests with data in x-www-form-urlencoded format
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    this.app.use(correlationIdMiddleware);

    // Enables cors
  }
}

export default App;
