import { Router } from 'express';
import * as categoryController from './category.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', authenticate, authorizeRoles('superadmin', 'admin'), categoryController.createCategory);
router.patch('/:id', authenticate, authorizeRoles('superadmin', 'admin'), categoryController.updateCategory);
router.put('/:id', authenticate, authorizeRoles('superadmin', 'admin'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorizeRoles('superadmin', 'admin'), categoryController.deleteCategory);

export default router;
