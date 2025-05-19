import express from "express";
import {deleteTentang, getTentang, updateTentang, saveTentang} from "../controllers/TentangController.js";
import { verifyToken, AdminOnly } from "../middleware/VerifyToken.js";

const router = express.Router();
router.get('/tentang', getTentang);
router.post('/tentang', verifyToken, AdminOnly, saveTentang);
router.patch('/tentang/:id', verifyToken, AdminOnly, updateTentang);
router.delete('/tentang/:id', verifyToken, AdminOnly, deleteTentang);



export default router;