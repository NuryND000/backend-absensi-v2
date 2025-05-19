import mongoose from "mongoose";

const Mapel = mongoose.Schema({
    name:{
        type: String,
        require: true
    }
});

export default mongoose.model('Mapel', Mapel);