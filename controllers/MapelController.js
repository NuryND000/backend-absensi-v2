import Mapel from "../models/MapelModel.js";
import csv from "csvtojson";

export const getMapel = async (req, res) => {
    try {
        const mapels = await Mapel.find();
        res.json(mapels);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getMapelById = async (req, res) => {
    try {
        const mapel = await Mapel.findById(req.params.id);
        res.json(mapel);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const saveMapel = async (req, res) => {
    const mapel = new Mapel(req.body);
    try {
        const insertedmapel = await mapel.save();
        res.status(281).json(insertedmapel);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export const updateMapel = async (req, res) => {
    try {
        const updatedmapel = await Mapel.updateOne({_id:req.params.id}, {$set: req.body});
        res.status(200).json(updatedmapel);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export const deleteMapel = async (req, res) => {
    try {
        const deletedmapel = await Mapel.deleteOne({_id:req.params.id});
        res.status(200).json(deletedmapel);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export const importMapel = async (req, res) => {
    try {
      const csvData = await csv().fromFile(req.file.path);
  
      // Map over csvData to hash passwords
      const mapelData = await Promise.all(csvData.map(async (mapel) => {
        return {
          name: mapel.Nama,
        };
      }));
      await Mapel.insertMany(mapelData);
      res.status(200).json({ msg: "Berhasil Upload" });
    } catch (error) {
      res.status(500).json({ msg: "Gagal upload", error: error.message });
    }
  };