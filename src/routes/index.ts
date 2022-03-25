import express, { Request, Response, Router } from "express";

class Routes {
    public router: Router;

    constructor() {
        this.router = express.Router();

        this.router.get('/', (req: Request, res: Response) => {
            res.status(200).send('Hola!!!');
        });
    }
}

export default new Routes().router;