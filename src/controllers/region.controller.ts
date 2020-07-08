import { Application } from 'express';
import { RegionService } from '../services/region.service';
import { Connection, Repository } from 'typeorm';
import { Region } from '../entities/region';
import { LoggingService } from '../logging';
import { Request, Response, NextFunction } from "express";
import InternalServerException from '../exceptions/InternalServerException';

export class RegionController {
  private regionService: RegionService;

  constructor(private app: Application, connection: Connection) {
    this.regionService = new RegionService(connection.getRepository(Region));
    this.routes();
  }

  public routes() {
    // The bind is needed like it is described at 
    // https://stackoverflow.com/questions/40018472/implement-express-controller-class-with-typescript
    this.app.route("/region").post(this.regionService.createRegion.bind(this.regionService));
    this.app.route("/regions/initialize").post(this.regionService.createRegion.bind(this.regionService));
  }

}