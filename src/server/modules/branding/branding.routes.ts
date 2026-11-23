import { Router } from 'express';
import * as brandingController from './branding.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = Router();

router.get('/', brandingController.getBranding);
router.patch('/', authenticate, authorizeRoles('superadmin', 'admin'), brandingController.updateBranding);
router.put('/', authenticate, authorizeRoles('superadmin', 'admin'), brandingController.updateBranding);

export default router;
