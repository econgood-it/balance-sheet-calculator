import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Controller } from './main.controller';

class App {
  public app: Application;
  //declaring our controller
  public balanceSheetController: Controller;


  constructor() {
    this.app = express();
    this.setConfig();
    //Creating and assigning a new instance of our controller
    this.balanceSheetController = new Controller(this.app);
  }

  private setConfig() {
    //Allows us to receive requests with data in json format
    this.app.use(bodyParser.json({ limit: '50mb' }));

    //Allows us to receive requests with data in x-www-form-urlencoded format
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended:true}));

    //Enables cors   
    this.app.use(cors());
  }
}

export default new App().app;