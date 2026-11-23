import { Router } from 'express';
import * as bookingController from './booking.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, bookingController.getBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.post('/', authenticate, bookingController.createBooking);
router.patch('/:id/status', authenticate, bookingController.updateBookingStatus);
router.patch('/:id/assign', authenticate, bookingController.updateBookingStatus);

export default router;
