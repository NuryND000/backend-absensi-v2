import express from "express";
import { getTahunAjar, getTahunAjarById, getTahunBydate, saveTahunAjar, updateTahunAjar, deleteTahunAjar, importTahunAjar } from "../controllers/TahunAjarController.js";
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



router.post('/import-tahun',upload.single('file'),verifyToken,importTahunAjar);
router.get('/tahun', getTahunAjar);
router.get('/tahun/:id', getTahunAjarById);
router.get('/tahun/date/:date', getTahunBydate);
router.post('/tahun', saveTahunAjar);
router.patch('/tahun/:id', verifyToken, updateTahunAjar);
router.delete('/tahun/:id', verifyToken, deleteTahunAjar);



export default router;