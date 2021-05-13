import { Application } from 'express';
import { HealthCheckService } from '../services/health.check.service';

export class HealthCheckController {
  constructor(
    private app: Application,
    public healthCheckService: HealthCheckService
  ) {
    this.routes();
  }

  public routes() {
    this.app.get('/v1/check', this.healthCheckService.welcomeMessage);
  }
}
