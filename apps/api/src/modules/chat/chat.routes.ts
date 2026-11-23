import { Router } from 'express';
import * as chatController from './chat.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/history/:otherUserId', authenticate, chatController.getChatHistory);

export default router;
