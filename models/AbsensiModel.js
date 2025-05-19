import mongoose from "mongoose";

const Absensi = mongoose.Schema({
    tanggal:{
        type: Date,
        require: false
    },
    kelas_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Kelas'
    },
    mapel_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Mapel'
    },
    keterangan:{
        type: String,
        require: false
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    tahun_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TahunAjar'
    }
});

export default mongoose.model('Absensi', Absensi);