import express from "express";
import * as services from "../services/main.services";
import { Request, Response } from "express";

const mainRouter = express.Router();

mainRouter.post("/edit-profile", async (req: Request, res: Response) => {
    await services.editUserProfile(req, res);
});

mainRouter.get("/get-number-of-user-skills", async (req: Request, res: Response) => {
    await services.getNumberOfUserSkills(req, res);
});

mainRouter.get("/get-user-skills", async (req: Request, res: Response) => {
    await services.getUserSkills(req, res);
});

mainRouter.post("/edit-user-skills", async (req: Request, res: Response) => {
    await services.editUserSkills(req, res);
});

mainRouter.get("/get-swap-history", async (req: Request, res: Response) => {
    await services.getSwapHistory(req, res);
});

export default mainRouter;