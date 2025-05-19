import express from "express";
import { 
    deleteSiswa,
    getSiswa, 
    getSiswaById,
    saveSiswa,
    updateSiswa,
    getSiswaByKelas,
    importSiswa,
    getSiswaByUserId
 } from "../controllers/SiswaController.js";
import { verifyToken, AdminOnly } from "../middleware/VerifyToken.js";
 import { fileURLToPath } from "url";
 import multer from "multer";
 import path from "path";
 import bodyParser from "body-parser";

 const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(bodyParser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname, 'public')));

const storage = multer.diskStorage({
    destination:(req,file,cb) =>{
        cb(null,'./public/uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
});

const upload = multer({storage:storage});



router.post('/import-siswa',upload.single('file'),verifyToken, importSiswa);
router.get('/siswas', getSiswa);
router.get('/siswas/:id', getSiswaById);
router.get('/siswas/user/:id', getSiswaByUserId);
router.get('/siswas/kelas/:kelas_id', getSiswaByKelas);
router.post('/siswas',verifyToken, saveSiswa);
router.patch('/siswas/:id',verifyToken, updateSiswa);
router.delete('/siswas/:id',verifyToken, deleteSiswa);


export default router;