import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op, Sequelize } from "sequelize";
import { Request, Response } from "express";
import { decodedType } from "../types/decodedType";
import UserSkill from "../models/userSkill";
import User from "../models/user";
import Skill from "../models/skill";
import SkillNeed from "../models/offer/skillNeed";
import Offer from "../models/offer/offer";
import Participant from "../models/chat/participant";
import Conversation from "../models/chat/conversation";

dotenv.config();

async function getPendingOffers(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    // Fetch all offers where the user is the target and the status is 'pending'
    const offers = await Offer.findAll({
      where: {
        res_user_id: userId,
        status_id: "c6513017-a144-45ad-8188-b1f89fd1aa6a",
      },
    });

    // loop offer to find the skills needed for each offer
    const offersWithSkills = await Promise.all(
      offers.map(async (offer) => {
        const skillsNeeded = await SkillNeed.findAll({
          where: { skill_need_id: offer.req_skill_need_id },
          include: [
            {
              model: Skill,
              attributes: ["id", "name"],
            },
          ],
        });

        return {
          ...offer.toJSON(),
          skillsNeeded,
        };
      })
    );

    // Fetch user data for the offers
    const offersWithUserData = await Promise.all(
      offersWithSkills.map(async (offer) => {
        const user = await User.findByPk(offer.req_user_id, {
          include: [
            {
              model: UserSkill,
              attributes: ["skill_id"],
              include: [
                {
                  model: Skill,
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
          attributes: ["id", "firstname", "lastname", "picture_url"],
        });
        return {
          ...offer,
          user,
        };
      })
    );

    // count accepted offers
    const acceptedOffersCount = await Offer.count({
      where: {
        res_user_id: userId,
        status_id: "08b487ba-38e1-4870-a02c-3bfff0643d61",
      },
    });

    // count completed offers
    const completedOffersCount = await Offer.count({
      where: {
        res_user_id: userId,
        status_id: "f3813160-560e-44fa-94a7-3b1fdf730ad2",
      },
    });

    // count rejected offers
    const rejectedOffersCount = await Offer.count({
      where: {
        res_user_id: userId,
        status_id: "21821f01-5c3e-4631-b707-c49ffb7811c6",
      },
    });

    return res.status(200).json({
      pendingOffers: offersWithUserData,
      acceptedOffersCount,
      completedOffersCount,
      rejectedOffersCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function acceptOffer(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    const { offerId, skillId } = req.body;

    // Find the offer
    const offer = await Offer.findByPk(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Check if the user is the target of the offer
    if (offer.res_user_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check if the skill ID is valid
    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      return res.status(400).json({ message: "Invalid skill ID" });
    }

    // Check if the user has the skill
    const targetUserSkill = await UserSkill.findOne({
      where: {
        user_id: offer.req_user_id,
        skill_id: skillId,
      },
    });
    if (!targetUserSkill) {
      return res
        .status(400)
        .json({ message: "User does not have the required skill" });
    }

    // Check if the offer is already accepted
    if (offer.status_id !== "c6513017-a144-45ad-8188-b1f89fd1aa6a") {
      return res.status(400).json({ message: "Offer is not pending" });
    }

    await SkillNeed.create({
      skill_need_id: offer.res_skill_need_id,
      skill_id: skillId,
    });

    // Update the offer status to 'accepted'
    offer.status_id = "08b487ba-38e1-4870-a02c-3bfff0643d61";
    await offer.save();

    //create a conversation between the two users

    const conversation = await Participant.findOne({
      where: {
        user_id: {
          [Op.in]: [userId, offer.req_user_id],
        },
      },
      attributes: ["conversation_id"], // Only need the conversation ID
      group: ["conversation_id"], // Group by conversation ID
      having: Sequelize.literal("COUNT(DISTINCT user_id) = 2"), // Ensure both users are in the same conversation
    });

    if (conversation) {
      return res
        .status(200)
        .json({ status: "found", id: conversation.conversation_id });
    }

    // Create a new conversation
    const newConversation = await Conversation.create();

    // Add participants to the conversation
    await Participant.create({
      conversation_id: newConversation.id,
      user_id: userId,
    });

    await Participant.create({
      conversation_id: newConversation.id,
      user_id: offer.req_user_id,
    });

    return res.status(200).json({ message: "Offer accepted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function rejectOffer(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    const { offerId } = req.body;

    // Find the offer
    const offer = await Offer.findByPk(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Check if the user is the target of the offer
    if (offer.res_user_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check if the offer is already accepted or rejected
    if (offer.status_id !== "c6513017-a144-45ad-8188-b1f89fd1aa6a") {
      return res.status(400).json({ message: "Offer is not pending" });
    }

    // Update the offer status to 'rejected'
    offer.status_id = "21821f01-5c3e-4631-b707-c49ffb7811c6";
    await offer.save();

    return res.status(200).json({ message: "Offer rejected successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function completeOffer(req: Request, res: Response) {
  try {
    if (!req.cookies.whoami) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      req.cookies.whoami,
      process.env.JWT_SECRET as string
    );
    const userId = (decoded as decodedType).id;

    const { offerId } = req.body;

    // Find the offer
    const offer = await Offer.findByPk(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Check if the user is the target of the offer or the requester
    if (offer.req_user_id !== userId && offer.res_user_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check if the offer is already completed
    if (offer.status_id !== "08b487ba-38e1-4870-a02c-3bfff0643d61") {
      return res.status(400).json({ message: "Offer is not accepted" });
    }

    // Update the offer status to 'completed'
    offer.status_id = "f3813160-560e-44fa-94a7-3b1fdf730ad2";
    await offer.save();

    return res.status(200).json({ message: "Offer completed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export { getPendingOffers, acceptOffer, rejectOffer, completeOffer };
