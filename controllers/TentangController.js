import Tentang from "../models/TentangModel.js";


export const getTentang = async (req, res) => {
    try {
        const data = await Tentang.find();
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const saveTentang = async (req, res) => {
    const data = new Tentang(req.body);
    try {
        const inserteddata = await data.save();
        res.status(281).json(inserteddata);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export const updateTentang = async (req, res) => {
    try {
        const data = await Tentang.updateOne({_id:req.params.id}, {$set: req.body});
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export const deleteTentang = async (req, res) => {
    try {
        const data = await Tentang.deleteOne({_id:req.params.id});
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}
