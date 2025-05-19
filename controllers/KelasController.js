import Kelas from "../models/KelasModel.js";
import csv from "csvtojson";

export const getKelas = async (req, res) => {
    try {
        const kelass = await Kelas.find();
        res.json(kelass);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getKelasById = async (req, res) => {
    try {
        const kelas = await Kelas.findById(req.params.id);
        res.json(kelas);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const saveKelas = async (req, res) => {
    const kelas = new Kelas(req.body);
    try {
        const insertedkelas = await kelas.save();
        res.status(201).json(insertedkelas);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export const updateKelas = async (req, res) => {
    try {
        const updatedkelas = await Kelas.updateOne({_id:req.params.id}, {$set: req.body});
        res.status(200).json(updatedkelas);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export const deleteKelas = async (req, res) => {
    try {
        const deletedkelas = await Kelas.deleteOne({_id:req.params.id});
        res.status(200).json(deletedkelas);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export const importKelas = async (req, res) => {
    try {
      const csvData = await csv().fromFile(req.file.path);
  
      // Map over csvData to hash passwords
      const kelasData = await Promise.all(csvData.map(async (kelas) => {
        return {
          name: kelas.Nama,
        };
      }));
      await Kelas.insertMany(kelasData);
      res.status(200).json({ msg: "Berhasil Upload" });
    } catch (error) {
      res.status(500).json({ msg: "Gagal upload", error: error.message });
    }
  };