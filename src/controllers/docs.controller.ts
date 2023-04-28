import { Application } from 'express';
import { DocsService } from '../services/docs.service';
import { Configuration } from '../reader/configuration.reader';
const swaggerUi = require('swagger-ui-express');
export class DocsController {
  private docsService: DocsService;
  constructor(private app: Application, configuration: Configuration) {
    this.docsService = new DocsService(configuration);
    this.routes();
  }

  public routes() {
    this.app.use(
      '/v1/docs/ui',
      swaggerUi.serve,
      swaggerUi.setup(this.docsService.getSwaggerDocument())
    );
    this.app.use(
      '/v1/docs/download',
      this.docsService.download.bind(this.docsService)
    );
  }
}
