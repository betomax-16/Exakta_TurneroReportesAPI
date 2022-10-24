import express, { Application } from "express";
import router from "./routes";
import routerApi from './routes/api';
import swaggerUi = require('swagger-ui-express');
import { getEnv } from "./enviroment";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs = require('fs');
import CronTask, { reportMountGeneral, reportMountByHour, reportMountDetail, reportWeekGeneral, reportWeekByHour, reportWeekDetail } from './utils/cronTask';

class Server {
    public app: Application;

    /* Arrancan archivos Swagger */
    private swaggerFile: any = (process.cwd()+"\\swagger\\swagger.json");
    private swaggerData: any = fs.readFileSync(this.swaggerFile, 'utf8');
    private customCss: any = fs.readFileSync((process.cwd()+"\\swagger\\swagger.css"), 'utf8');
    private swaggerDocument = JSON.parse(this.swaggerData);

    constructor() {
        this.app = express();
        this.config();
        console.log(process.env.PORT);
    }

    private config(): void {
        getEnv();
        const {MONGO_URI_DEV, MONGO_URI_TEST, MONGO_URI_PROD, MONGO_USER_AZURE, MONGO_PASS_AZURE, MODE} = process.env;

        let dataBase: any  = '';
        if (MODE === 'PROD') {
            dataBase = MONGO_URI_PROD || '';
            mongoose.connect(dataBase, { replicaSet: 'testrep' });
          }
          else if (MODE === 'TEST') {
            dataBase = MONGO_URI_TEST || '';
            mongoose.connect(dataBase, { replicaSet: 'testrep', w: 1});
          }
          else if (MODE === 'DEV') {
            dataBase = MONGO_URI_DEV || '';
            // mongoose.connect(dataBase, { replicaSet: 'testrep' });
            mongoose.connect(dataBase, { replicaSet: 'testrep' });
          }

        const db = mongoose.connection;

        db.on('error', function(err){
            console.log('connection error', err)
        });

        db.once('open', function(){
            console.log(`Mode: ${MODE}`);
            console.log(`Connection to DB successful on: ${dataBase}`);
            // new initDB();
        });

        new CronTask([reportWeekGeneral, reportWeekByHour, reportWeekDetail, reportMountGeneral, reportMountByHour, reportMountDetail]);
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false}));
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(this.swaggerDocument, undefined, undefined, this.customCss));
        this.app.use(router);
        this.app.use('/api', routerApi);
    }
}

export default new Server().app;