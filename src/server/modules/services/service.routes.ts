import { Router } from 'express';
import * as serviceController from './service.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = Router();

router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', authenticate, authorizeRoles('superadmin', 'admin', 'vendor'), serviceController.createService);
router.patch('/:id', authenticate, authorizeRoles('superadmin', 'admin', 'vendor'), serviceController.updateService);
router.put('/:id', authenticate, authorizeRoles('superadmin', 'admin', 'vendor'), serviceController.updateService);
router.delete('/:id', authenticate, authorizeRoles('superadmin', 'admin'), serviceController.deleteService);

export default router;
