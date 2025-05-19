import express from "express";
import {
  deleteAbsensi,
  getAbsensi,
  getAbsensiById,
  getAbsensiByKelasTanggal,
  saveAbsensi,
  updateAbsensi,
  saveManyAbsensi,
  getDataCounts,
  getDetailAbsensiByAbsensiId,
  getAbsensiLaporan,
  getAbsensiByUserId,
  getDetailAbsensiByUserId,
} from "../controllers/AbsensiController.js";
import { verifyToken, AdminOnly } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/absensis", getAbsensi);
router.get("/laporan/:id/:tanggal", getAbsensiByKelasTanggal);
router.get("/absensis/:id", getAbsensiById);
router.post("/absensis", verifyToken, saveAbsensi);
router.post("/absensis/insert", saveManyAbsensi);
router.patch("/absensis/:id", verifyToken, updateAbsensi);
router.delete("/absensis/:id", verifyToken, deleteAbsensi);
router.get("/data/all-data-counts", getDataCounts);
router.get("/absensi/:id/details", getDetailAbsensiByAbsensiId);
router.get("/absensi/laporan", getAbsensiLaporan);
router.get("/absensi/user/:userId", getAbsensiByUserId);
router.get("/detail-absensi/:id/user-siswa", getDetailAbsensiByUserId);

export default router;
