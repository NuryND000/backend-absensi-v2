import express from "express";
import { 
    deleteMapel, 
    getMapel, 
    getMapelById, 
    saveMapel,
    updateMapel,
    importMapel
} from "../controllers/MapelController.js";
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



router.post('/import-mapel',upload.single('file'),verifyToken,importMapel);
router.get('/mapels', getMapel);
router.get('/mapels/:id', getMapelById);
router.post('/mapels', saveMapel);
router.patch('/mapels/:id', verifyToken, updateMapel);
router.delete('/mapels/:id', verifyToken, deleteMapel);



export default router;