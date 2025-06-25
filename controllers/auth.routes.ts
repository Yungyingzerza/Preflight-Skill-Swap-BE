import express from 'express';
import * as services from '../services/auth.services';
import { Request, Response } from 'express';
const authRouter = express.Router();

authRouter.post('/register', async (req: Request, res: Response) => {
    await services.register(req, res);
});

authRouter.post('/login', async (req: Request, res: Response) => {
    await services.login(req, res);
});

authRouter.get('/logout', async (req: Request, res: Response) => {
    await services.logout(req, res);
});


export default authRouter;