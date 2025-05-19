import express from "express";
import { 
    deleteGuru,
    getGuru, 
    getGuruById,
    saveGuru,
    updateGuru,
    importGuru,
    getGuruByUserId
 } from "../controllers/GuruController.js";
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
    filename:(req,file,cb)=>{1
        cb(null,file.originalname)
    }
});

const upload = multer({storage:storage});



router.post('/import-guru',upload.single('file'),verifyToken, importGuru);
router.get('/guru', getGuru);
router.get('/guru/:id', getGuruById);
router.get('/guru/user/:id', getGuruByUserId);
router.post('/guru',verifyToken, saveGuru);
router.patch('/guru/:id',verifyToken, updateGuru);
router.delete('/guru/:id',verifyToken, deleteGuru);


export default router;