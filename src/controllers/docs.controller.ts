import { Application } from 'express';
import { Configuration } from '../reader/configuration.reader';
import { DocsService } from '../services/docs.service';
export class DocsController {
  private docsService: DocsService;
  constructor(private app: Application, configuration: Configuration) {
    this.docsService = new DocsService(configuration);
    this.routes();
  }

  public routes() {
    this.app.use(
      '/v1/docs/download',
      this.docsService.download.bind(this.docsService)
    );
  }
}
