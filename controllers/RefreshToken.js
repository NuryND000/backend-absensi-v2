import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const refreshToken = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.sendStatus(401);
        const user = await User.find({refresh_token : refreshToken});
        if(!user[0]) return res.sendStatus(403);
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if(err) return res.sendStatus(403);
            const userId = user[0]._id;
            const username = user[0].username;
            const name = user[0].name;
            const kelasId = user[0].class_id;
            const alamat = user[0].alamat;
            const tmplahir = user[0].tmplahir;
            const tgllahir = user[0].tgllahir;
            const role = user[0].role;
            const accessToken = jwt.sign({userId, username, name, kelasId, alamat, tmplahir, tgllahir, role}, process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: '1d'
            });
            res.json({accessToken});
        })
    } catch (error) {
        console.log(error);
    }
}