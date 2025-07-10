import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op } from "sequelize";
import { Request, Response } from "express";
import { decodedType } from '../types/decodedType';
import UserSkill from "../models/userSkill";
import UserSkillLearn from "../models/userSkillLearn";
import User from "../models/user";
import Skill from "../models/skill";
import SkillNeed from "../models/offer/skillNeed";
import Offer from "../models/offer/offer";

dotenv.config();

const search = async (req : Request, res : Response) => {
    try {
        if (!req.cookies.whoami) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!req.body.input) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try{
            const decoded = jwt.verify(req.cookies.whoami, process.env.JWT_SECRET as string);
            const userId = (decoded as decodedType).id;

            const { input } = req.body;
            // find users with skills matching the input by firstname, lastname, skillname in userSkill table
            const userSkills = await UserSkill.findAll({
                where: {
                    [Op.or]: [
                        {
                            '$User.firstname$': {
                                [Op.iLike]: `%${input}%`
                            }
                        },
                        {
                            '$User.lastname$': {
                                [Op.iLike]: `%${input}%`
                            }
                        },
                        {
                            '$Skill.name$': {
                                [Op.iLike]: `%${input}%`
                            }
                        }
                    ]
                },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'firstname', 'lastname', 'picture_url'],
                    },
                    {
                        model: Skill,
                        attributes: ['id', 'name', 'description', 'picture_url'],
                    }
                ],
                // order: [
                // ],
            });
            
            return res.status(200).json(userSkills);

        }catch(err){
            // return res.status(401).json({ message: 'Unauthorized' });
            return res.status(401).json({ message: err });
        }

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const requestSwap = async (req: Request, res: Response) => {
    try {
        if (!req.cookies.whoami) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!req.body.targetUserId || !req.body.skillId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            const decoded = jwt.verify(req.cookies.whoami, process.env.JWT_SECRET as string);
            const userId = (decoded as decodedType).id;

            // Validate the target user ID and skill ID
            const { targetUserId, skillId } = req.body;
            // cant request swap with yourself
            if (userId === targetUserId) {
                return res.status(400).json({ message: 'You cannot request a swap with yourself' });
            }

            // Check if the target user exists
            const targetUser = await User.findByPk(targetUserId);
            if (!targetUser) {
                return res.status(404).json({ message: 'Target user not found' });
            }

            // Check if the target user has the skill
            const targetUserSkill = await UserSkill.findOne({
                where: {
                    user_id: targetUserId,
                    skill_id: skillId
                }
            });
            if (!targetUserSkill) {
                return res.status(404).json({ message: 'Target user does not have the specified skill' });
            }

            // Check if the user already has an ongoing swap with the target user
            const ongoingSwap = await Offer.findOne({
                where: {
                    [Op.or]: [
                        {
                            req_user_id: userId,
                            res_user_id: targetUserId,
                        },
                        {
                            req_user_id: targetUserId,
                            res_user_id: userId,
                        }
                    ]
                }
            });
            if (ongoingSwap) {
                return res.status(400).json({ message: 'You already have an ongoing swap with this user' });
            }

            // Create a new swap request
            const newOffer = await Offer.create({
                req_user_id: userId,
                res_user_id: targetUserId,
                status_id: 'c6513017-a144-45ad-8188-b1f89fd1aa6a' // 'Pending' status ID
            });
            
            // Create skill needs for requested user
            await SkillNeed.create({
                skill_need_id: newOffer.req_skill_need_id,
                skill_id: skillId // The skill the user is offering
            });

            return res.status(200).json({ message: 'Swap request sent successfully', offerId: newOffer.id });

        } catch (err) {
            return res.status(401).json({ message: err });
        }

    }
    catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

async function getTargetUserData(req: Request, res: Response) {
    try {
        if (!req.cookies.whoami) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(req.cookies.whoami, process.env.JWT_SECRET as string);
        const userId = (decoded as decodedType).id;

        const { targetUserId } = req.body;
        
        if (!targetUserId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Fetch user data, user skill, user skill learn
        const userData = await User.findOne({
            where: { id: targetUserId },
            attributes: ['id', 'firstname', 'lastname', 'bio', 'picture_url'],
            include: [
                {
                    model: UserSkill,
                    attributes: ['skill_id'],
                    include: [{
                        model: Skill,
                        attributes: ['id', 'name']
                    }]
                },
                {
                    model: UserSkillLearn,
                    attributes: ['skill_id'],
                    include: [{
                        model: Skill,
                        attributes: ['id', 'name']
                    }]
                }
            ]
        });

        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(userData);

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}
    

export {
    search,
    requestSwap,
    getTargetUserData
};