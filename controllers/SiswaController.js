import Siswa from "../models/SiswaModel.js";
import Kelas from "../models/KelasModel.js";
import User from "../models/UserModel.js";
import mongoose from 'mongoose';
import bcrypt from "bcrypt";
import csv from "csvtojson";

const ObjectId = mongoose.Types.ObjectId;

export const getSiswa = async (req, res) => {
  try {
    const siswas = await Siswa.aggregate([
      {
        $lookup: {
          from: "kelas",
          localField: "kelas_id",
          foreignField: "_id",
          as: "kelas",
        },
      },
    ]);
    res.json(siswas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSiswaById = async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.id);
    res.json(siswa);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getSiswaByUserId = async (req, res) => {
  try {
    const siswa = await Siswa.aggregate([
      {
        $match: {
          user_id: new ObjectId(req.params.id)
        }
      },
      {
        $lookup: {
          from: "kelas",
          localField: "kelas_id",
          foreignField: "_id",
          as: "kelas",
        }
      }
    ]);
    res.json(siswa);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getSiswaByKelas = async (req, res) => {
  try {
    const siswa = await Siswa.find({ kelas_id: req.params.kelas_id });
    
        res.json(siswa);
  } catch (error) {
    const siswa = await Siswa.find();
    res.json(siswa);
  }
};

export const saveSiswa = async (req, res) => {
  const { nisn, name, tgllahir, tmplahir, alamat, kelas_id } = req.body;
  const role = "siswa";
  const password = "smpn3";
  try {
    const salt = await bcrypt.genSalt();
    const hashPassword = password ? await bcrypt.hash(password, salt) : undefined;
    const inserteduser = await User.create({
      username: nisn,
      password: hashPassword,
      role,
    });
    const insertedsiswa = await Siswa.create({
      nisn,
      name,
      alamat,
      tmplahir,
      tgllahir,
      kelas_id,
      user_id: inserteduser._id,
    });
    res.status(281).json(insertedsiswa);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSiswa = async (req, res) => {
  try {
    const updatedsiswa = await Siswa.updateOne(
      { _id: req.params.id },
      { $set: req.body },
    );
    res.status(200).json(updatedsiswa);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSiswa = async (req, res) => {
  try {
    const siswa =  await Siswa.findById(req.params.id);
    const user_id = siswa.user_id;
    const deletedUser = await User.deleteOne({ _id: user_id });
    const deletedsiswa = await Siswa.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedsiswa);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const importSiswa = async (req, res) => {
  try {
    const csvData = await csv().fromFile(req.file.path);

    // Map over csvData to hash passwords
    const siswaData = await Promise.all(csvData.map(async (siswa) => {
      const kelas_id = await Kelas.find({name: siswa.Kelas});
      return {
        nisn: siswa.Nisn,
        name: siswa.Nama,
        alamat: siswa.Alamat,
        tmplahir: siswa.Tempat_Lahir,
        tgllahir: siswa.Tanggal_Lahir,
        kelas_id: kelas_id[0]._id,
      };
    }));
    await Siswa.insertMany(siswaData);
    res.status(200).json({ msg: "Berhasil Upload" });
  } catch (error) {
    res.status(500).json({ msg: "Gagal upload", error: error.message });
  }
};