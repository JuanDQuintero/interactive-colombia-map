import express from 'express';
import { getAllDepartments, getAttractionsByDepartment } from '../controllers/attractionsController.ts';

const router = express.Router();

router.get('/departments', getAllDepartments);
router.get('/departments/:departmentId/attractions', getAttractionsByDepartment);

export default router;