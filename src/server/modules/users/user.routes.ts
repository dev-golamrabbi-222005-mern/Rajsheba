import { Router } from 'express';
import * as userController from './user.controller.js';
import * as authController from '../auth/auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = Router();

// /users
router.get('/', userController.getAllUsers);
router.post('/', authController.register); // Frontend calls POST /users to register
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, userController.updateMe);

export default router;
