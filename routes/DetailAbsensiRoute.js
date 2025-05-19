import express from "express";
import { 
    deleteDetailAbsensi,
    getDetailAbsensi,
    getDetailAbsensiById,
    saveDetailAbsensi,
    saveManyDetailAbsensi,
    updateDetailAbsensi,
    updateDetailAbsensiMany,
    deleteDetailAbsensiMany,
    getDetailAbsensis,
    getDetailAbsensiMany
} from "../controllers/DetailAbsensiController.js";

const router = express.Router();

router.get('/detailabsensis', getDetailAbsensi);
router.get('/detailabsensis/absensi/:id', getDetailAbsensis);
router.get('/detailabsensis/:id', getDetailAbsensiById);
router.post('/detailabsensis', saveDetailAbsensi);
router.post('/detailabsensis/many', saveManyDetailAbsensi);
router.patch('/detailabsensis/:id', updateDetailAbsensi);
router.patch('/detailabsensis/update', updateDetailAbsensiMany);
router.delete('/detailabsensis/:id', deleteDetailAbsensi);
router.delete('/detailabsensis/many/:absensi_id', deleteDetailAbsensiMany);
router.get('/detail/many', getDetailAbsensiMany);



export default router;