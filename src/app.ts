import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Application } from 'express';
import { registerBalanceSheetRoutes } from './controllers/balance.sheet.controller';
import errorMiddleware from './middleware/error.middleware';
import {
  Authentication,
  IAuthenticationProvider,
} from './security/authentication';

import { DataSource } from 'typeorm';
import { DocsController } from './controllers/docs.controller';
import { HealthCheckController } from './controllers/health.check.controller';
import { IndustryController } from './controllers/industry.controller';
import { registerOrganizationRoutes } from './controllers/organization.controller';
import { RegionController } from './controllers/region.controller';
import { registerWorkbookRoutes } from './controllers/workbook.controller';
import { LoggingService } from './logging';
import correlationIdMiddleware from './middleware/correlation.id.middleware';
import morganMiddleware from './middleware/morgan.http.logging.middleware';
import { Configuration } from './reader/configuration.reader';
import { makeBalanceSheetService } from './services/balance.sheet.service';
import { HealthCheckService } from './services/health.check.service';
import { IndustryService } from './services/industry.service';
import { makeOrganizationService } from './services/organization.service';
import { RegionService } from './services/region.service';
import { makeWorkbookService } from './services/workbook.service';
import { registerUserRoutes } from './controllers/user.controller';
import { makeUserService } from './services/user.service';
import { IRepoProvider } from './repositories/repo.provider';
import { registerAuditRoutes } from './controllers/audit.controller';
import { makeAuditService } from './services/audit.service';

class App {
  public readonly app: Application;
  // declaring our controllers
  private regionController: RegionController;
  private industryController: IndustryController;
  private healthCheckController: HealthCheckController;
  private docsController: DocsController;
  private authentication: Authentication;

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

    registerBalanceSheetRoutes(
      this.app,
      makeBalanceSheetService(dataSource, repoProvider)
    );

    registerUserRoutes(this.app, makeUserService(dataSource, repoProvider));

    const regionService = new RegionService();
    this.regionController = new RegionController(this.app, regionService);
    this.industryController = new IndustryController(
      this.app,
      new IndustryService()
    );
    registerWorkbookRoutes(this.app, makeWorkbookService());
    this.healthCheckController = new HealthCheckController(
      this.app,
      new HealthCheckService()
    );
    registerOrganizationRoutes(
      this.app,
      makeOrganizationService(dataSource, repoProvider)
    );
    registerAuditRoutes(this.app, makeAuditService(dataSource, repoProvider));
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
