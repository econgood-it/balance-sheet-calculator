import { Application } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { DocsService } from '../services/docs.service';
const swaggerUi = require('swagger-ui-express');

export class DocsController {
  private swaggerDocument: any;
  private docsService: DocsService;
  constructor(private app: Application) {
    this.swaggerDocument = this.buildSwaggerDoc();
    this.docsService = new DocsService(this.swaggerDocument);
    this.routes();
  }

  private buildSwaggerDoc() {
    const pathToDocs = path.resolve(__dirname, '../openapi');
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'ECG Balance Calculator',
          version: '3.0.0',
        },
      },
      apis: [`${pathToDocs}/**/*.yaml`], // files containing annotations as above
    };
    return swaggerJSDoc(options);
  }

  public routes() {
    this.app.use(
      '/v1/docs/ui',
      swaggerUi.serve,
      swaggerUi.setup(this.swaggerDocument)
    );
    this.app.use(
      '/v1/docs/download',
      this.docsService.download.bind(this.docsService)
    );
  }
}
