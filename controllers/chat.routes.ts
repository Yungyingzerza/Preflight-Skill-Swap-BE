import express from 'express';
import * as services from '../services/chat.services';
const chatRouter = express.Router();

chatRouter.post('/individual', async (req, res) => {
    await services.createIndividualConversation(req, res);
});

chatRouter.post('/send', async (req, res) => {
    await services.sendMessage(req, res);
});

chatRouter.get('/read/:id', async (req, res) => {
    await services.readAllMessages(req, res);
});

chatRouter.get('/:id', async (req, res) => {
    await services.getAllConversationMessages(req, res);
});

chatRouter.get('/', async (req, res) => {
    await services.getAllConversations(req, res);
});


export default chatRouter;