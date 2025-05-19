import mongoose from "mongoose";

const User = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
},
name: {
    type: String,
    required: true
},
alamat: {
    type: String,
    required: true
},
tmplahir: {
    type: String,
    required: true
},
tgllahir: {
    type: Date,
    required: true
},
password: {
    type: String,
    required: true
},
role: {
    type: String,
    enum: ['admin', 'guru', 'siswa'],
    required: true
},
class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kelas',
    default: null  // Guru dan Admin tidak perlu class_id
},
refresh_token: {
    type: String,
    default: null
}
}, { timestamps: true });

export default mongoose.model("User", User);
