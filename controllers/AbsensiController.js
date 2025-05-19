import Absensi from "../models/AbsensiModel.js";
import Mapel from "../models/MapelModel.js";
import Kelas from "../models/KelasModel.js";
import User from "../models/UserModel.js";
import TahunAjar from "../models/TahunAjarModel.js";
import DetailAbsensi from "../models/DetailAbsensiModel.js";
import mongoose from "mongoose";

export const getAbsensi = async (req, res) => {
  try {
    const absensi = await Absensi.find().populate(
      "user_id kelas_id mapel_id tahun_id"
    );
    res.json(absensi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAbsensiByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Ambil userId dari parameter URL
    const absensi = await Absensi.find({ user_id: userId }).populate(
      "user_id kelas_id mapel_id tahun_id"
    );

    res.json(absensi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAbsensiById = async (req, res) => {
  try {
    const absensi = await Absensi.findById(req.params.id).populate(
      "user_id kelas_id mapel_id tahun_id"
    );
    res.json(absensi);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getAbsensiByKelasTanggal = async (req, res) => {
  try {
    const date = new Date(req.params.tanggal); // Assuming tanggal is passed as a query parameter
    const month = date.getUTCMonth() + 1; // getUTCMonth() returns month from 0-11, hence +1
    const year = date.getUTCFullYear();

    const absensi = await Absensi.find({
      kelas_id: req.params.id,
      $expr: {
        $and: [
          { $eq: [{ $month: "$tanggal" }, month] },
          { $eq: [{ $year: "$tanggal" }, year] },
        ],
      },
    });

    res.json(absensi);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const saveAbsensi = async (req, res) => {
  try {
    const {
      tanggal,
      user_id,
      kelas_id,
      mapel_id,
      tahun_id,
      keterangan,
      detailAbsensi,
    } = req.body;

    // Simpan absensi
    const absensi = new Absensi({
      tanggal,
      user_id,
      kelas_id,
      mapel_id,
      tahun_id,
      keterangan,
    });
    await absensi.save();

    // Simpan detail absensi
    const details = detailAbsensi.map((detail) => ({
      absensi_id: absensi._id,
      user_id: detail.user_id,
      status: detail.status,
      keterangan: detail.keterangan,
    }));

    await DetailAbsensi.insertMany(details);

    res.status(201).json({ message: "Absensi berhasil disimpan", absensi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveManyAbsensi = async (req, res) => {
  const options = { ordered: true };
  try {
    const insertedabsensi = await Absensi.insertMany(req.body, options);
    res.status(201).json(insertedabsensi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAbsensi = async (req, res) => {
  try {
    const { id } = req.params;
    const { mapel_id, keterangan, detailAbsensi } = req.body;

    // Cek apakah absensi ada
    const absensi = await Absensi.findById(id);
    if (!absensi) {
      return res.status(404).json({ message: "Absensi tidak ditemukan" });
    }

    // Update data absensi
    absensi.mapel_id = mapel_id;
    absensi.keterangan = keterangan;
    await absensi.save();

    // Update atau tambahkan detail absensi
    for (const detail of detailAbsensi) {
      await DetailAbsensi.findOneAndUpdate(
        { absensi_id: id, user_id: detail.user_id },
        { status: detail.status, keterangan: detail.keterangan },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: "Absensi berhasil diperbarui", absensi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAbsensi = async (req, res) => {
  try {
    const deletedabsensi = await Absensi.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedabsensi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDataCounts = async (req, res) => {
  try {
    const [gurus, murids, mataPelajarans, kelases] = await Promise.all([
      User.find({ role: "guru" }),
      User.find({ role: "siswa" }),
      Mapel.find(),
      Kelas.find(),
    ]);

    const dataCounts = [
      { name: "Guru", count: gurus.length },
      { name: "Siswa", count: murids.length },
      { name: "Mapel", count: mataPelajarans.length },
      { name: "Kelas", count: kelases.length },
    ];

    res.json(dataCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAbsensiLaporan = async (req, res) => {
  try {
    const { user_id, mapel_id, kelas_id, tahun_id } = req.query;

    // Validasi input
    if (!user_id || !mapel_id || !kelas_id || !tahun_id) {
      return res.status(400).json({ message: "Semua parameter harus diisi" });
    }

    const userId = new mongoose.Types.ObjectId(user_id);
    const mapelId = new mongoose.Types.ObjectId(mapel_id);
    const classId = new mongoose.Types.ObjectId(kelas_id);
    const tahunId = new mongoose.Types.ObjectId(tahun_id);

    const absensi = await DetailAbsensi.aggregate([
      {
        $lookup: {
          from: "absensis",
          localField: "absensi_id",
          foreignField: "_id",
          as: "absensis",
        },
      },
      { $unwind: "$absensis" },
      {
        $match: {
          "absensis.tahun_id": tahunId,
          "absensis.user_id": userId,
          "absensis.mapel_id": mapelId,
          "absensis.kelas_id": classId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$user_id",
          name: { $first: "$user.name" }, // Tambahkan nama user
          total_hadir: {
            $sum: { $cond: [{ $eq: ["$status", "h"] }, 1, 0] },
          },
          total_izin: { $sum: { $cond: [{ $eq: ["$status", "i"] }, 1, 0] } },
          total_sakit: {
            $sum: { $cond: [{ $eq: ["$status", "s"] }, 1, 0] },
          },
          total_alpa: { $sum: { $cond: [{ $eq: ["$status", "a"] }, 1, 0] } },
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    res.json(absensi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDetailAbsensiByAbsensiId = async (req, res) => {
  try {
    const details = await DetailAbsensi.find({
      absensi_id: req.params.id,
    }).populate("user_id absensi_id");
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDetailAbsensiByUserId = async (req, res) => {
  try {
    const details = await DetailAbsensi.find({
      user_id: req.params.id,
    })
      .populate("user_id")
      .populate({
        path: "absensi_id",
        populate: ["kelas_id", "mapel_id", "tahun_id", "user_id"],
      });

    res.json(details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
