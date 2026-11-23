import { Router } from 'express';
import * as reviewController from './review.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, reviewController.createReview);

export default router;
