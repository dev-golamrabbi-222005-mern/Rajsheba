import { Router } from 'express';
import * as couponController from './coupon.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = Router();

router.get('/', couponController.getCoupons);
router.post('/', authenticate, authorizeRoles('superadmin', 'admin'), couponController.createCoupon);

export default router;
