import express from "express";
import * as services from "../services/request.services";
import { Request, Response } from "express";

const requestRouter = express.Router();

requestRouter.get("/pending-offers", async (req: Request, res: Response) => {
    await services.getPendingOffers(req, res);
});

requestRouter.post("/accept-offer", async (req: Request, res: Response) => {
    await services.acceptOffer(req, res);
});

requestRouter.post("/reject-offer", async (req: Request, res: Response) => {
    await services.rejectOffer(req, res);
});

requestRouter.post("/complete-offer", async (req: Request, res: Response) => {
    await services.completeOffer(req, res);
});

export default requestRouter;