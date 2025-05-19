import mongoose from "mongoose";

const Guru = mongoose.Schema({
  nip: {
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
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Guru", Guru);
