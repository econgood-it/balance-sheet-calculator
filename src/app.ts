import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { BalanceSheetController } from './controllers/balance.sheet.controller';
import { Authentication } from './security/authentication';
import errorMiddleware from './middleware/error.middleware';

import { LoggingService } from './logging';
import { BalanceSheetService } from './services/balance.sheet.service';
import { Configuration } from './configuration.reader';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { HealthCheckService } from './services/health.check.service';
import { HealthCheckController } from './controllers/health.check.controller';
import { DocsController } from './controllers/docs.controller';
import correlationIdMiddleware from './middleware/correlation.id.middleware';
import { RegionService } from './services/region.service';
import { RegionController } from './controllers/region.controller';
import { IndustryController } from './controllers/industry.controller';
import { IndustryService } from './services/industry.service';
import { ApiKeyController } from './controllers/api.key.controller';
import { ApiKeyService } from './services/api.key.service';
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationService } from './services/organization.service';
import { DataSource } from 'typeorm';
import { IRepoProvider } from './repositories/repo.provider';

class App {
  public readonly app: Application;
  // declaring our controllers
  private balanceSheetController: BalanceSheetController;
  private regionController: RegionController;
  private industryController: IndustryController;
  private userController: UserController;
  private apiKeyController: ApiKeyController;
  private healthCheckController: HealthCheckController;
  private organizationController: OrganizationController;
  private docsController: DocsController;
  private authentication: Authentication;

  constructor(
    dataSource: DataSource,
    private configuration: Configuration,
    repoProvider: IRepoProvider
  ) {
    this.app = express();
    this.setConfig();
    this.authentication = new Authentication(dataSource);
    this.authentication.addBasicAuthToDocsEndpoint(this.app, configuration);
    this.authentication.addAuthToApplication(this.app, configuration.jwtSecret);
    // Creating controllers
    const balanceSheetService = new BalanceSheetService(
      dataSource,
      repoProvider
    );
    this.balanceSheetController = new BalanceSheetController(
      this.app,
      balanceSheetService
    );
    const regionService = new RegionService();
    this.regionController = new RegionController(this.app, regionService);
    this.industryController = new IndustryController(
      this.app,
      new IndustryService()
    );
    const userService = new UserService(
      dataSource,
      repoProvider,
      configuration.jwtSecret
    );
    this.userController = new UserController(this.app, userService);
    const apiKeyService = new ApiKeyService(dataSource, repoProvider);
    this.apiKeyController = new ApiKeyController(this.app, apiKeyService);
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
