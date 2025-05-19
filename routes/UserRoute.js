import express from "express";
import { verifyToken, AdminOnly } from "../middleware/VerifyToken.js";
import {
  deleteUser,
  getUser,
  getUserById,
  saveUser,
  updateUser,
  Login,
  Logout,
  changePassword,
} from "../controllers/UserController.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import { fileURLToPath } from "url";
import multer from "multer";
import path from "path";
import bodyParser from "body-parser";
import XLSX from "xlsx";
import bcrypt from "bcrypt";
import User from "../models/UserModel.js";
import Kelas from "../models/KelasModel.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, "public")));

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/import-user-baru", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File tidak ditemukan." });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const parseExcelDate = (excelDate) => {
      if (typeof excelDate === "number") {
        return new Date((excelDate - 25569) * 86400 * 1000);
      }
      return new Date(excelDate);
    };

    const success = [];
    const failed = [];

    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];

      // Validasi wajib isi
      if (!item.username || !item.password || !item.name || !item.role) {
        failed.push({
          row: i + 2,
          reason: "Data wajib (username, password, name, role) kosong.",
          data: item,
        });
        continue;
      }

      // Untuk role 'admin' dan 'guru', kelas tidak diperlukan
      let class_id = null;
      if (item.role === 'siswa') {
        // Cari ID kelas dari nama jika role adalah 'siswa'
        const kelas = await Kelas.findOne({ name: item.kelas });
        if (!kelas) {
          failed.push({
            row: i + 2,
            reason: `Kelas '${item.kelas}' tidak ditemukan.`,
            data: item,
          });
          continue;
        }
        class_id = kelas._id; // Tentukan class_id jika ada
      }

      // Siapkan data user
      const newUser = {
        username: String(item.username),
        name: item.name,
        class_id: class_id, // Untuk role selain siswa, class_id tetap kosong
        alamat: item.alamat || "",
        tmplahir: item.tmplahir || "",
        tgllahir: item.tgllahir ? parseExcelDate(item.tgllahir) : null,
        password: await bcrypt.hash(item.password, 10),
        role: item.role,
      };

      try {
        await User.create(newUser);
        success.push({ row: i + 2, username: item.username });
      } catch (err) {
        failed.push({
          row: i + 2,
          reason: err.message,
          data: item,
        });
      }
    }

    res.status(200).json({
      message: "Proses import selesai.",
      total: jsonData.length,
      berhasil: success.length,
      gagal: failed.length,
      detail_gagal: failed,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users", getUser);
router.get("/users/:id", getUserById);
router.post("/users", saveUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", verifyToken, deleteUser);
router.post("/login", Login);
router.get("/token", refreshToken);
router.delete("/logout", Logout);
router.put("/change-password", verifyToken, changePassword);

router.post("/update-user-class", upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const success = [];
    const failed = [];
    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];
      if (!item.username || !item.kelas) continue; // pastikan dua data ini ada
      const user = await User.findOne({ username: item.username });
      if (user) {
        const newClass = await Kelas.findOne({ name: item.kelas }); // pastikan kamu punya model Kelas
        if (newClass) {
          user.class_id = newClass._id;
          try {
            await user.save();
            success.push({ row: i + 2, username: item.username });
          } catch (err) {
            failed.push({
              row: i + 2,
              reason: err.message,
              data: item.username,
            });
          }
        } else {
          failed.push({
            row: i + 2,
            reason: "Kelas tidak ditemukan",
            data: item.username,
          });
        }
      } else {
        failed.push({
          row: i + 2,
          reason: "User tidak ditemukan",
          data: item.username,
        });
      }
    }

    res.status(200).json({
      message: "Proses update selesai.",
      total: jsonData.length,
      berhasil: success.length,
      gagal: failed.length,
      detail_gagal: failed, // Changed from failed.data to failed (Array of failed rows)
    });
  } catch (error) {
    console.error("Gagal mengupdate kelas siswa:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengupdate kelas." });
  }
});




export default router;
