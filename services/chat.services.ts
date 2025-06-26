import User from "../models/user";
import Conversation from "../models/chat/conversation";
import Message from "../models/chat/message";
import Participant from "../models/chat/participant";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op, Sequelize } from "sequelize";
import { getSocketId, io } from "../socket/socket";
import { Request, Response } from "express";
import { decodedType } from '../types/decodedType';

dotenv.config();

const createIndividualConversation = async (req : Request, res : Response) => {
    // Create a new individual conversation
    try {
        if (!req.cookies.whoami) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        //check request body
        if (!req.body.receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        const { receiverId } = req.body;

        // Check if the receiver exists
        const receiver = await User.findOne({
            where: {
                id: receiverId,
            },
        });

        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        try {
            const decoded = jwt.verify(req.cookies.whoami, process.env.JWT_SECRET as string);
            const userId = (decoded as decodedType).id;

            const conversation = await Participant.findOne({
                where: {
                    user_id: {
                        [Op.in]: [userId, receiverId], // Both users must be participants
                    },
                },
                attributes: ['conversation_id'], // Only need the conversation ID
                group: ['conversation_id'], // Group by conversation ID
                having: Sequelize.literal('COUNT(DISTINCT user_id) = 2'), // Ensure both users are in the same conversation
            });
        

            if (conversation) {
                return res.status(200).json({ status: 'found', id: conversation.conversation_id });
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
                user_id: receiverId,
            });

            return res.status(201).json({ conversation: newConversation, id: newConversation.id });

        } catch(err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllConversations = async (req : Request, res : Response) => {
    // Get all conversations of the current user
    try {
        if (!req.cookies.whoami) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try{
            const decoded = jwt.verify(req.cookies.whoami, process.env.JWT_SECRET as string);
            const userId = (decoded as decodedType).id;

            // Get all conversations of the current user
            const conversations = await Conversation.findAll({
                include: [
                    {
                        model: Participant,
                        where: {
                            user_id: userId,
                        },

                    },
                ]
            });

            //get all participants of each conversation
            for (let i = 0; i < conversations.length; i++) {
                const conversation = conversations[i];
                const participants = await Participant.findAll({
                    where: {
                        conversation_id: conversation.id,
                    },
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'firstname', 'lastname', 'picture_url']
                        },

                    ],
                    attributes: [],
                });

                conversation.dataValues.participants = participants;
            }

            //get the last message of each conversation
            for (let i = 0; i < conversations.length; i++) {
                const conversation = conversations[i];
                const lastMessage = await Message.findOne({
                    where: {
                        conversation_id: conversation.id,
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'firstname', 'lastname', 'picture_url']
                        },
                    ],
                    attributes: ['id', 'message', 'is_read', 'createdAt', 'sender_id'],
                });

                conversation.dataValues.lastMessage = lastMessage;
            }

            //sort the conversations by the last message updatedAt
            conversations.sort((a, b) => {
                const aDate = a.dataValues.lastMessage?.dataValues.createdAt?.getTime() ?? 0;
                const bDate = b.dataValues.lastMessage?.dataValues.createdAt?.getTime() ?? 0;

                return bDate - aDate; // Descending: latest first
            });

            return res.status(200).json({ conversations });
        }catch(err){
            return res.status(401).json({ message: 'Unauthorized' });
        }

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const sendMessage = async (req : Request, res : Response) => {
    // Send a message to a conversation
    try {
        if (!req.cookies.whoami) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        //check request body
        if (!req.body.conversationId || !req.body.content) {
            return res.status(400).json({ message: 'Conversation ID and content are required' });
        }

        const { conversationId, content } = req.body;

        try{
            const decoded = jwt.verify(req.cookies.whoami, process.env.JWT_SECRET as string);
            const userId = (decoded as decodedType).id;

            // Check if the conversation exists
            const conversation = await Conversation.findOne({
                where: {
                    id: conversationId,
                },
            });

            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }

            // Check if the user is a participant of the conversation
            const participant = await Participant.findOne({
                where: {
                    conversation_id: conversationId,
                    user_id: userId,
                },
            });

            if (!participant) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            // Send a message to the conversation
                const newMessage = await Message.create({
                    conversation_id: conversationId,
                    sender_id: userId,
                    message: content,
                });

                // Update the message status
                const participants = await Participant.findAll({
                    where: {
                        conversation_id: conversationId,
                    },
                });


                participants.forEach((element) => {
                    const socketId = getSocketId(element.user_id);
                    if (socketId) {
                        io.to(socketId).emit('receive_message');
                    }
                    
                });


                return res.status(201).json({ message: newMessage });
        }catch(err){
            return res.status(401).json({ message: 'Unauthorized' });
        }

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllConversationMessages = async (req : Request, res : Response) => {
    // Get all messages of a conversation
    try {
        if (!req.cookies.whoami) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        //check request body
        if (!req.params.id) {
            return res.status(400).json({ message: 'Conversation ID is required' });
        }

        const conversationId = req.params.id;

        try{
            const decoded = jwt.verify(req.cookies.whoami, process.env.JWT_SECRET as string);
            const userId = (decoded as decodedType).id;

                // Check if the conversation exists
                const conversation = await Conversation.findOne({
                    where: {
                        id: conversationId,
                    },
                });

                if (!conversation) {
                    return res.status(404).json({ message: 'Conversation not found' });
                }

                // Check if the user is a participant of the conversation
                const participant = await Participant.findOne({
                    where: {
                        conversation_id: conversationId,
                        user_id: userId,
                    },
                });

                if (!participant) {
                    return res.status(403).json({ message: 'Forbidden' });
                }

                // Get all messages of the conversation ordered by createdAt
                const messages = await Message.findAll({
                    where: {
                        conversation_id: conversationId,
                    },
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'firstname', 'lastname', 'picture_url']
                        },
                    ],
                    attributes: ['id', 'message', 'is_read', 'createdAt', 'sender_id'],
                    order: [
                        ['createdAt', 'ASC']
                    ],
                });

                return res.status(200).json({ messages });
        }catch(err){
            return res.status(401).json({ message: 'Unauthorized' });
        }

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const readAllMessages = async (req : Request, res : Response) => {
    // Read all messages of a conversation
    try {
        if (!req.cookies.whoami) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        //check request body
        if (!req.params.id) {
            return res.status(400).json({ message: 'Conversation ID is required' });
        }

        const conversationId = req.params.id;

        try{
            const decoded = jwt.verify(req.cookies.whoami, process.env.JWT_SECRET as string);
            const userId = (decoded as decodedType).id;

            // Check if the conversation exists
            const conversation = await Conversation.findOne({
                where: {
                    id: conversationId,
                },
            });

            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }

            // Check if the user is a participant of the conversation
            const participant = await Participant.findOne({
                where: {
                    conversation_id: conversationId,
                    user_id: userId,
                },
            });

            if (!participant) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            // find all messages of the conversation
            const messages = await Message.findAll({
                where: {
                    conversation_id: conversationId,
                },
            });

            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                await Message.update({
                    is_read: true,
                }, {
                    where: {
                        id: message.id,
                        sender_id: {
                            [Op.ne]: userId, // Only update messages not sent by the user
                        },
                    },
                });
            }

            return res.status(200).json({ message: 'All messages are read' });
        }catch(err){
            return res.status(401).json({ message: 'Unauthorized' });
        }

    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};



export {
    createIndividualConversation,
    getAllConversations,
    sendMessage,
    getAllConversationMessages,
    readAllMessages,
};