import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op } from "sequelize";
import { Request, Response } from "express";
import { decodedType } from "../types/decodedType";
import UserSkill from "../models/userSkill";
import UserSkillLearn from "../models/userSkillLearn";
import User from "../models/user";
import Skill from "../models/skill";
import SkillNeed from "../models/offer/skillNeed";
import Offer from "../models/offer/offer";
import Status from "../models/offer/status";

dotenv.config();

async function editUserProfile(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    const { firstname, lastname, bio, picture_url } = req.body;

    if (!firstname || !lastname) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstname = firstname;
    user.lastname = lastname;
    user.bio = bio || user.bio;
    user.picture_url = picture_url || user.picture_url;

    await user.save();

    return res
      .status(200)
      .json({ message: "Profile updated successfully", user });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

async function getNumberOfUserSkills(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    const userSkillsCount = await UserSkill.count({
      where: {
        user_id: userId,
      },
    });
    const swapCompletedCount = await Offer.count({
      where: {
        [Op.or]: [
          {
            req_user_id: userId,
            status_id: "f3813160-560e-44fa-94a7-3b1fdf730ad2",
          },
          {
            res_user_id: userId,
            status_id: "f3813160-560e-44fa-94a7-3b1fdf730ad2",
          }, // 'Completed' status ID
        ],
      },
    });

    return res.status(200).json({
      userSkillsCount,
      swapCompletedCount,
    });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

async function getUserSkills(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    const userSkills = await UserSkill.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Skill,
          attributes: ["id", "name"],
        },
      ],
    });

    return res.status(200).json(userSkills);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getUserSkillsLearn(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    const userSkillsLearn = await UserSkillLearn.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Skill,
          attributes: ["id", "name"],
        },
      ],
    });

    return res.status(200).json(userSkillsLearn);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function editUserSkills(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: "Invalid skills data" });
    }

    // Clear existing skills
    await UserSkill.destroy({ where: { user_id: userId } });

    // Add new skills
    const userSkills = skills.map((skill) => ({
      user_id: userId,
      skill_id: skill.id,
    }));

    await UserSkill.bulkCreate(userSkills);

    return res
      .status(200)
      .json({ message: "User skills updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function editUserSkillsLearn(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: "Invalid skills data" });
    }

    // Clear existing skills
    await UserSkillLearn.destroy({ where: { user_id: userId } });

    // Add new skills
    const userSkillsLearn = skills.map((skill) => ({
      user_id: userId,
      skill_id: skill.id,
    }));

    await UserSkillLearn.bulkCreate(userSkillsLearn);

    return res
      .status(200)
      .json({ message: "User skills learn updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getSwapHistory(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    const swapOffers = await Offer.findAll({
      where: {
        [Op.or]: [{ req_user_id: userId }, { res_user_id: userId }],
      },
      include: [
        {
          model: Status,
          attributes: ["id", "name"],
        },
      ],
    });
    const swapHistory = await Promise.all(
      swapOffers.map(async (offer) => {
        const partnerUserId =
          offer.req_user_id === userId ? offer.res_user_id : offer.req_user_id;
        const partnerUser = await User.findByPk(partnerUserId, {
          attributes: ["id", "firstname", "lastname", "picture_url"],
        });

        let partnerSkills = [];

        if (!partnerUser) {
          return null; // or handle the case where the partner user is not found
        }

        if (offer.req_user_id === userId) {
          // User requested the swap, get skills from res_skill_need_id
          partnerSkills = await SkillNeed.findAll({
            where: { skill_need_id: offer.req_skill_need_id },
            include: [
              {
                model: Skill,
                attributes: ["id", "name"],
              },
            ],
          });
        } else {
          // User is being requested, get skills from req_skill_need_id
          partnerSkills = await SkillNeed.findAll({
            where: { skill_need_id: offer.res_skill_need_id },
            include: [
              {
                model: Skill,
                attributes: ["id", "name"],
              },
            ],
          });
        }

        return {
          offer,
          partnerUser,
          partnerSkills,
        };
      })
    );
    return res.status(200).json(swapHistory.filter((item) => item !== null));
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export {
  editUserProfile,
  getUserSkillsLearn,
  getNumberOfUserSkills,
  getUserSkills,
  editUserSkills,
  editUserSkillsLearn,
  getSwapHistory,
};
