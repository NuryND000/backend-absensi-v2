import mongoose from "mongoose";

const DetailAbsensi = mongoose.Schema({
  absensi_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Absensi",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }, // Siswa
  status: {
    type: String,
    enum: ["h", "i", "s", "a"],
    required: true,
  },
  keterangan: {
    type: String,
    require: false,
  },
});

export default mongoose.model("DetailAbsensi", DetailAbsensi);
