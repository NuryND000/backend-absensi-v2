import mongoose from "mongoose";

const TahunAjar = mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    startDate:{
        type: Date,
        require: false
    },
    endDate:{
        type: Date,
        require: false
    },
    semester:{
        type: String,
        require: true
    }
});

export default mongoose.model('TahunAjar', TahunAjar);