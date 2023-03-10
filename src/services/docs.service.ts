import { Request, Response } from 'express';
import { OpenAPIObject } from 'openapi3-ts';
import { buildSwaggerDoc } from '../openapi/swagger.doc';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export class DocsService {
  private swaggerDocument: OpenAPIObject = buildSwaggerDoc();

  public download(req: Request, res: Response) {
    const json = JSON.stringify(this.swaggerDocument);
    const filename = `${this.swaggerDocument.info.title}.json`;
    const mimetype = 'application/json';
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.send(json);
  }

  public getSwaggerDocument() {
    return this.swaggerDocument;
  }
}
