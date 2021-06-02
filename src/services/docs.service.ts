import { Request, Response } from 'express';

export class DocsService {
  constructor(private swaggerDocument: any) {}

  public download(req: Request, res: Response) {
    const json = JSON.stringify(this.swaggerDocument);
    const filename = 'api.json';
    const mimetype = 'application/json';
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.send(json);
  }
}
