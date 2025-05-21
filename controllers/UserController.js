import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import csv from "csvtojson";

// GET Semua User (Tanpa Password & Refresh Token)
export const getUser = async (req, res) => {
  try {
    const users = await User.find(
      {},
      { password: 0, refresh_token: 0 }
    ).populate("class_id", "name");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET User by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, {
      password: 0,
      refresh_token: 0,
    }).populate("class_id", "name");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// POST Tambah User
export const saveUser = async (req, res) => {
  const {
    username,
    name,
    alamat,
    tmplahir,
    tgllahir,
    password,
    role,
    class_id,
  } = req.body;
  try {
    const salt = await bcrypt.genSalt();
    const hashPassword = password
      ? await bcrypt.hash(password, salt)
      : undefined;

    await User.create({
      username,
      name,
      alamat,
      tmplahir,
      tgllahir,
      password: hashPassword,
      role,
      class_id: role === "siswa" ? class_id : null, // class_id hanya untuk siswa
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT Update User
export const updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.body.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    if (req.body.role !== "siswa") {
      updateData.class_id = null; // Jika role bukan siswa, hapus class_id
    }

    const updatedUser = await User.updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE Hapus User
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const Login = async (req, res) => {
  try {
    const users = await User.find({ username: req.body.username });
    if (!users.length)
      return res.status(404).json({ msg: "user tidak ditemukan" });
    const match = await bcrypt.compare(req.body.password, users[0].password);
    if (!match) return res.status(400).json({ msg: "Wrong Password" });

    const user = users[0];
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    await User.updateOne({ _id: user._id }, { refresh_token: refreshToken });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Ubah ke true jika menggunakan HTTPS
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
      // secure: true  // Uncomment if using https
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(404).json({ msg: "user tidak ditemukan" });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  const user = await User.find({ refresh_token: refreshToken });
  if (!user.length) return res.sendStatus(204);
  const userId = user[0]._id;
  await User.updateOne({ _id: userId }, { refresh_token: null });
  res.clearCookie("refreshToken");
  return res.sendStatus(200);
};

// POST Import User dari CSV
export const importUser = async (req, res) => {
  try {
    console.log("Uploaded File:", req.file); // Debugging
    if (!req.file) {
      return res.status(400).json({ msg: "File tidak ditemukan" });
    }

    const csvData = await csv().fromFile(req.file.path);

    if (csvData.length === 0) {
      return res.status(400).json({ msg: "File CSV kosong" });
    }

    const results = await Promise.allSettled(
      csvData.map(async (user) => {
        try {
          const hashedPassword = await bcrypt.hash(
            user.Password,
            await bcrypt.genSalt()
          );

          let classId = null;
          if (user.Role.toLowerCase() === "siswa" && user.Kelas) {
            const kelas = await Class.findOne({ name: user.Kelas.trim() });

            if (!kelas) {
              throw new Error(`Kelas '${user.Kelas}' tidak ditemukan`);
            }

            classId = kelas._id;
          }

          return {
            username: user.username,
            name: user.Nama,
            alamat: user.Alamat,
            tmplahir: user.Tempat_Lahir,
            tgllahir: new Date(user.Tanggal_Lahir),
            password: hashedPassword,
            role: user.Role.toLowerCase(),
            class_id: classId,
          };
        } catch (error) {
          return { error: error.message };
        }
      })
    );

    const successfulUsers = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const failedUsers = results
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);

    if (successfulUsers.length === 0) {
      return res
        .status(400)
        .json({ msg: "Tidak ada user yang berhasil diimport" });
    }

    await User.insertMany(successfulUsers);

    res.status(200).json({
      msg: "Import users successful",
      successCount: successfulUsers.length,
      failedCount: failedUsers.length,
      failedUsers,
    });
  } catch (error) {
    res.status(500).json({ msg: "Upload failed", error: error.message });
  }
};

// POST Update User Class ID dari CSV
export const updateUserClass = async (req, res) => {
  try {
    console.log("Uploaded File:", req.file); // Debugging
    if (!req.file) {
      return res.status(400).json({ msg: "File tidak ditemukan" });
    }

    const csvData = await csv().fromFile(req.file.path);

    if (csvData.length === 0) {
      return res.status(400).json({ msg: "File CSV kosong" });
    }

    const results = await Promise.allSettled(
      csvData.map(async (user) => {
        try {
          // Cari user berdasarkan username
          const existingUser = await User.findOne({ username: user.username.trim() });
          
          if (!existingUser) {
            throw new Error(`User dengan username '${user.username}' tidak ditemukan`);
          }

          // Cari kelas berdasarkan nama kelas
          let classId = null;
          if (user.Kelas) {
            const kelas = await Class.findOne({ name: user.Kelas.trim() });

            if (!kelas) {
              throw new Error(`Kelas '${user.Kelas}' tidak ditemukan`);
            }

            classId = kelas._id;
          }

          // Mengembalikan data update
          return {
            username: user.username.trim(),
            class_id: classId,
          };
        } catch (error) {
          return { error: error.message };
        }
      })
    );

    const successfulUpdates = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const failedUpdates = results
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);

    if (successfulUpdates.length === 0) {
      return res
        .status(400)
        .json({ msg: "Tidak ada user yang berhasil diupdate" });
    }

    // Update class_id untuk user yang berhasil
    await Promise.all(
      successfulUpdates.map(async (update) => {
        await User.updateOne(
          { username: update.username },
          { $set: { class_id: update.class_id } }
        );
      })
    );

    res.status(200).json({
      msg: "Update class_id successful",
      successCount: successfulUpdates.length,
      failedCount: failedUpdates.length,
      failedUpdates,
    });
  } catch (error) {
    res.status(500).json({ msg: "Update failed", error: error.message });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId); // Ambil user berdasarkan ID dari token

    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Password lama salah." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password berhasil diperbarui." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
