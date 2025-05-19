import mongoose from "mongoose";
import DetailAbsensi from "../models/DetailAbsensiModel.js";
import Absensi from "../models/AbsensiModel.js";

const ObjectId = mongoose.Types.ObjectId;

export const getDetailAbsensi = async (req, res) => {
  try {
    const detailabsensis = await DetailAbsensi.find().populate(
      "user_id absensi_id"
    );
    res.json(detailabsensis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDetailAbsensis = async (req, res) => {
  try {
    const detailabsensis = await DetailAbsensi.find({
      absensi_id: req.params.id,
    }).populate("user_id absensi_id");
    res.json(detailabsensis);
  } catch (error) {
    console.log("Error:", error); // Log the error
    res.status(500).json({ message: error.message });
  }
};

export const getDetailAbsensiById = async (req, res) => {
  try {
    const detailabsensi = await DetailAbsensi.findById(req.params.id);
    res.json(detailabsensi);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const saveDetailAbsensi = async (req, res) => {
  const detailabsensi = new DetailAbsensi(req.body);
  try {
    const inserteddetailabsensi = await detailabsensi.save();
    res.status(201).json(inserteddetailabsensi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const saveManyDetailAbsensi = async (req, res) => {
  const options = { ordered: true };
  try {
    const inserteddetailabsensi = await DetailAbsensi.insertMany(
      req.body,
      options
    );
    res.status(201).json(inserteddetailabsensi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDetailAbsensi = async (req, res) => {
  try {
    const updateddetailabsensi = await DetailAbsensi.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(updateddetailabsensi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDetailAbsensiMany = async (req, res) => {
  try {
    const data = req.body.detailabsensis;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "Invalid data array" });
    }

    const updatePromises = data.map((item) => {
      const filter = { _id: item._id };
      const update = { $set: item };
      return DetailAbsensi.updateOne(filter, update);
    });

    const results = await Promise.all(updatePromises);

    // Check if any updates failed
    const failedUpdates = results.filter((result) => result.nModified === 0);
    if (failedUpdates.length > 0) {
      return res
        .status(400)
        .json({ message: `${failedUpdates.length} updates failed` });
    }

    res
      .status(200)
      .json({ message: "All documents updated successfully", results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDetailAbsensi = async (req, res) => {
  try {
    const deleteddetailabsensi = await DetailAbsensi.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json(deleteddetailabsensi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDetailAbsensiMany = async (req, res) => {
  try {
    const deleteddetailabsensi = await DetailAbsensi.deleteMany({
      absensi_id: req.params.absensi_id,
    });
    res.status(200).json(deleteddetailabsensi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDetailAbsensiMany = async (req, res) => {
  try {
    const { absensiIds } = req.body;
    const validIds = absensiIds.map((id) => new ObjectId(id));
    const absensiDetails = await Absensi.find({
      absensi_id: { $in: validIds },
    }); // Query the database for these _id's
    res.json([absensiDetails, req.body]);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
