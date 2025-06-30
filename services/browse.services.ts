import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op, Sequelize } from "sequelize";
import { getSocketId, io } from "../socket/socket";
import { Request, Response } from "express";
import { decodedType } from '../types/decodedType';
import UserSkill from "../models/userSkill";
import User from "../models/user";
import Skill from "../models/skill";

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

export {
    search
};