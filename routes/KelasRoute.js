import express from "express";
import { getKelas, getKelasById, saveKelas, updateKelas, deleteKelas, importKelas } from "../controllers/kelasController.js";
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



router.post('/import-kelas',upload.single('file'),verifyToken,importKelas);
router.get('/kelass', getKelas);
router.get('/kelass/:id', getKelasById);
router.post('/kelass', saveKelas);
router.patch('/kelass/:id', verifyToken, updateKelas);
router.delete('/kelass/:id', verifyToken, deleteKelas);



export default router;