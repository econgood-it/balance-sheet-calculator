import { Application } from 'express';
import { ApiKeyService } from '../services/api.key.service';

export class ApiKeyController {
  constructor(private app: Application, public apiKeyService: ApiKeyService) {
    this.routes();
  }

  public routes() {
    this.app.post(
      '/v1/apikeys',
      this.apiKeyService.createApiKey.bind(this.apiKeyService)
    );
    this.app.delete(
      '/v1/apikeys/:id',
      this.apiKeyService.deleteApiKey.bind(this.apiKeyService)
    );
  }
}
