import express from "express";
import * as services from "../services/skill.services";
import { Request, Response } from "express";
const skillRouter = express.Router();

skillRouter.get("/", async (req: Request, res: Response) => {
  await services.getAllSkills(req, res);
});

export default skillRouter;
