import mongoose from "mongoose";

const Siswa = mongoose.Schema({
  nisn: {
    type: String,
    require: false,
  },
  name: {
    type: String,
    require: true,
  },
  alamat: {
    type: String,
    require: true,
  },
  tmplahir: {
    type: String,
    require: true,
  },
  tgllahir: {
    type: Date,
    require: true,
  },
  kelas_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Kelas",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Siswa", Siswa);
