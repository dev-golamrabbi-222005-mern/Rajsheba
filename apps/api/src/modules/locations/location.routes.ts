import { Router } from 'express';
import * as locationController from './location.controller.js';

const router = Router();

router.get('/devisions', locationController.getDevisions);
router.get('/districts', locationController.getDistricts);
router.get('/areas', locationController.getAreas);

export default router;
