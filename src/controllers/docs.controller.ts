import { Application } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
const swaggerUi = require('swagger-ui-express');

export class DocsController {
  private swaggerDocument: any;
  constructor(private app: Application) {
    this.swaggerDocument = this.buildSwaggerDoc();

    this.routes();
  }

  private buildSwaggerDoc() {
    const pathToDocs = path.resolve(__dirname, '../docs');
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'ECG Balance Calculator',
          version: '1.2.0',
        },
      },
      apis: [`${pathToDocs}/**/*.yaml`], // files containing annotations as above
    };
    return swaggerJSDoc(options);
  }

  public routes() {
    this.app.use(
      '/v1/docs',
      swaggerUi.serve,
      swaggerUi.setup(this.swaggerDocument)
    );
  }
}
