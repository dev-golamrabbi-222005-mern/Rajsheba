import { Router } from 'express';
import * as withdrawController from './withdraw.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, withdrawController.getWithdrawals);
router.post('/', authenticate, withdrawController.createWithdrawal);

export default router;
