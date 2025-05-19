import TahunAjar from "../models/TahunAjarModel.js";
import csv from "csvtojson";
import fs from "fs";

// Get semua tahun ajaran
export const getTahunAjar = async (req, res) => {
    try {
        const tahunAjars = await TahunAjar.find();
        res.json(tahunAjars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get tahun ajaran berdasarkan ID
export const getTahunAjarById = async (req, res) => {
    try {
        const tahunAjar = await TahunAjar.findById(req.params.id);
        if (!tahunAjar) {
            return res.status(404).json({ message: "Tahun ajaran tidak ditemukan" });
        }
        res.json(tahunAjar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getTahunBydate = async (req, res) => {
    const { date } = req.params; // Extracting date parameter from the URL

    try {
        // Convert the string date to a Date object
        const inputDate = new Date(date);

        // Check if the date is valid
        if (isNaN(inputDate)) {
            return res.status(400).json({ message: "Tanggal tidak valid" });
        }

        // Find the academic year that encompasses the input date
        const tahunAjar = await TahunAjar.findOne({
            startDate: { $lte: inputDate }, // Check if the start date is before or on the given date
            endDate: { $gte: inputDate }    // Check if the end date is after or on the given date
        });

        if (!tahunAjar) {
            return res.status(404).json({ message: "Tahun ajaran tidak ditemukan" });
        }

        // Return the found academic year
        res.json(tahunAjar);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Simpan tahun ajaran baru
export const saveTahunAjar = async (req, res) => {
    const tahunAjar = new TahunAjar(req.body);
    try {
        const insertedTahunAjar = await tahunAjar.save();
        res.status(201).json(insertedTahunAjar);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Update tahun ajaran berdasarkan ID
export const updateTahunAjar = async (req, res) => {
    try {
        const updatedTahunAjar = await TahunAjar.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(updatedTahunAjar);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Hapus tahun ajaran berdasarkan ID
export const deleteTahunAjar = async (req, res) => {
    try {
        const deletedTahunAjar = await TahunAjar.deleteOne({ _id: req.params.id });
        res.status(200).json(deletedTahunAjar);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Import tahun ajaran dari file CSV
export const importTahunAjar = async (req, res) => {
    try {
        const csvData = await csv().fromFile(req.file.path);

        const tahunAjarData = csvData.map((tahunAjar) => ({
            name: tahunAjar.Tahun,
            startDate: tahunAjar.Mulai,
            endDate: tahunAjar.Akhir, // Perbaikan typo dari endDtae -> endDate
            semester: tahunAjar.Semester,
        }));

        await TahunAjar.insertMany(tahunAjarData);

        // Hapus file setelah selesai diimport
        fs.unlinkSync(req.file.path);

        res.status(200).json({ msg: "Berhasil Upload" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal upload", error: error.message });
    }
};
