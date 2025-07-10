import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { decodedType } from "../types/decodedType";
import Skill from "../models/skill";

dotenv.config();

async function getAllSkills(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    const skills = await Skill.findAll({
      attributes: ["id", "name"],
    });
    return res.status(200).json(skills);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export { getAllSkills };
