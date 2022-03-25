import { Request, Response, Router } from 'express';
import traceHistoryController from "../../controllers/traceHistoryController";
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";
import moment from "moment";
import { checkJwt } from "../../middlewares/auth";

class TraceHistoryRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/reports/general')
                        .get([checkJwt], this.generalReport);
        this.router.route('/reports/generalByHour')
                        .get([checkJwt], this.generalReportByHour);
        this.router.route('/reports/detail')
                        .get([checkJwt], this.detailedReport);
    }

    async generalReport(req: Request, res: Response) {
        try {
            const formatDate1 = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/;

            if (req.query.startDate && 
                formatDate1.test(req.query.startDate.toString()) &&
                moment(req.query.startDate.toString()).isValid() &&
                req.query.finalDate && 
                formatDate1.test(req.query.finalDate.toString()) && 
                moment(req.query.finalDate.toString()).isValid()) {
                
                const startDate = moment(req.query.startDate.toString(), "YYYY-MM-DD").hour(0).minute(0).second(0).millisecond(0);
                const finalDate = moment(req.query.finalDate.toString(), "YYYY-MM-DD").hour(23).minute(59).second(59).millisecond(998);

                const sucursal: string|undefined = req.query.sucursal !== '' ? req.query.sucursal?.toString() : undefined;
                const area: string|undefined = req.query.area !== '' ? req.query.area?.toString() : undefined;
                
                const result = await traceHistoryController.generalReport(startDate.toDate(), finalDate.toDate(), sucursal, area);
                ResponseWrapper.handler(res, result, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 400);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async generalReportByHour(req: Request, res: Response) {
        try {
            const formatDate1 = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/;

            if (req.query.startDate && 
                formatDate1.test(req.query.startDate.toString()) &&
                moment(req.query.startDate.toString()).isValid() &&
                req.query.finalDate && 
                formatDate1.test(req.query.finalDate.toString()) && 
                moment(req.query.finalDate.toString()).isValid()) {
                
                const startDate = moment(req.query.startDate.toString(), "YYYY-MM-DD").hour(0).minute(0).second(0).millisecond(0);
                const finalDate = moment(req.query.finalDate.toString(), "YYYY-MM-DD").hour(23).minute(59).second(59).millisecond(998);

                const sucursal: string|undefined = req.query.sucursal !== '' ? req.query.sucursal?.toString() : undefined;
                const area: string|undefined = req.query.area !== '' ? req.query.area?.toString() : undefined;
                
                const result = await traceHistoryController.generalReportByHour(startDate.toDate(), finalDate.toDate(), sucursal, area);
                ResponseWrapper.handler(res, result, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 400);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async detailedReport(req: Request, res: Response) {
        try {
            const formatDate1 = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/;

            if (req.query.startDate && 
                formatDate1.test(req.query.startDate.toString()) &&
                moment(req.query.startDate.toString()).isValid() &&
                req.query.finalDate && 
                formatDate1.test(req.query.finalDate.toString()) && 
                moment(req.query.finalDate.toString()).isValid()) {
                
                const startDate = moment(req.query.startDate.toString(), "YYYY-MM-DD").hour(0).minute(0).second(0).millisecond(0);
                const finalDate = moment(req.query.finalDate.toString(), "YYYY-MM-DD").hour(23).minute(59).second(59).millisecond(998);

                const sucursal: string|undefined = req.query.sucursal !== '' ? req.query.sucursal?.toString() : undefined;
                const area: string|undefined = req.query.area !== '' ? req.query.area?.toString() : undefined;
                
                const result = await traceHistoryController.detailedReport(startDate.toDate(), finalDate.toDate(), sucursal, area);
                ResponseWrapper.handler(res, result, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 400);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }
}

export default new TraceHistoryRoutes().router;