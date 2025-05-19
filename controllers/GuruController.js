import Guru from "../models/GuruModel.js";
import Kelas from "../models/KelasModel.js";
import User from "../models/UserModel.js";
import mongoose from 'mongoose';
import bcrypt from "bcrypt";
import csv from "csvtojson";

const ObjectId = mongoose.Types.ObjectId;

export const getGuru = async (req, res) => {
  try {
    const gurus = await Guru.find();
    res.json(gurus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGuruById = async (req, res) => {
  try {
    const guru = await Guru.findById(req.params.id);
    res.json(guru);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getGuruByUserId = async (req, res) => {
  try {
    const guru = await Guru.aggregate([
      {
        $match: {
          user_id: new ObjectId(req.params.id)
        }
      }
    ]);
    res.json(guru);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const saveGuru = async (req, res) => {
  const { nip, name, tgllahir, tmplahir, alamat } = req.body;
  const role = "guru";
  const password = "smpn3";
  try {
    const salt = await bcrypt.genSalt();
    const hashPassword = password ? await bcrypt.hash(password, salt) : undefined;
    const inserteduser = await User.create({
      username: nip,
      password: hashPassword,
      role,
    });
    const insertedGuru = await Guru.create({
      nip,
      name,
      alamat,
      tmplahir,
      tgllahir,
      user_id: inserteduser._id,
    });
    res.status(281).json(insertedGuru);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateGuru = async (req, res) => {
  try {
    const updatedguru = await Guru.updateOne(
      { _id: req.params.id },
      { $set: req.body },
    );
    res.status(200).json(updatedguru);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteGuru = async (req, res) => {
  try {
    const guru =  await Guru.findById(req.params.id);
    const user_id = guru.user_id;
    const deletedUser = await User.deleteOne({ _id: user_id });
    const deletedGuru = await Guru.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedGuru);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const importGuru = async (req, res) => {
  try {
    const csvData = await csv().fromFile(req.file.path);

    // Map over csvData to hash passwords
    const GuruData = await Promise.all(csvData.map(async (guru) => {
      const kelas_id = await Kelas.find({name: guru.Kelas});
      return {
        nisn: guru.Nisn,
        name: guru.Nama,
        alamat: guru.Alamat,
        tmplahir: guru.Tempat_Lahir,
        tgllahir: guru.Tanggal_Lahir,
        kelas_id: kelas_id[0]._id,
      };
    }));
    await Guru.insertMany(GuruData);
    res.status(200).json({ msg: "Berhasil Upload" });
  } catch (error) {
    res.status(500).json({ msg: "Gagal upload", error: error.message });
  }
};