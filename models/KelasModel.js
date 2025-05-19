import mongoose from "mongoose";

const Kelas = mongoose.Schema({
    name:{
        type: String,
        require: true
    }
});

export default mongoose.model('Kelas', Kelas);