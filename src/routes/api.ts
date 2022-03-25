import { Router, Request, Response } from 'express';
import traceHistoryRoute from "./api/traceHistory";
import { ResponseWrapper } from "../utils/responseWrapper";

class Routes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.router.use(traceHistoryRoute);

        // respuesta default en caso de solicitar a una ruta no definida
        this.router.use((req: Request, res: Response) => {
            ResponseWrapper.handler(res, {message:'Resource not found.'}, 404);
        });
    }
}

export default new Routes().router;