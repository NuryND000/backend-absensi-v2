import mongoose from "mongoose";

const Tentang = mongoose.Schema({
    nis:{
        type: String,
        require: false
    },
    name:{
        type: String,
        require: true
    },
    alamat:{
        type: String,
        require: true
    },
    berdiri:{
        type: Date,
        require: true
    },
    deskripsi:{
        type: String,
        require: true
    }
});

export default mongoose.model('Tentang', Tentang);