import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import UserRoute from "./routes/UserRoute.js";
import KelasRoute from "./routes/KelasRoute.js";
import MapelRoute from "./routes/MapelRoute.js";
import SiswaRoute from "./routes/SiswaRoute.js";
import AbsensiRoute from "./routes/AbsensiRoute.js";
import DetailAbsensiRoute from "./routes/DetailAbsensiRoute.js";
import TentangRoute from "./routes/TentangRoute.js";
import GuruRoute from "./routes/GuruRoute.js";
import TahunAjarRoute from "./routes/TahunAjarRoute.js";

dotenv.config();

const app = express();
mongoose.connect('mongodb+srv://absensi_siswa:AH-LqU3NnTrjSzJ@cluster0.66uspww.mongodb.net/absensi_siswa',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Database Connected...'));

app.use(cookieParser());
app.use(cors({ credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(UserRoute);
app.use(KelasRoute);
app.use(MapelRoute);
app.use(SiswaRoute);
app.use(AbsensiRoute);
app.use(DetailAbsensiRoute);
app.use(TentangRoute);
app.use(GuruRoute);
app.use(TahunAjarRoute);

app.listen(1122, ()=> console.log('Server up and running...'));