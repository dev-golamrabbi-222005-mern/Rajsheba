import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', authController.refreshToken);
router.post('/send-otp', authController.sendOtp);
router.post('/resend-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

export default router;
