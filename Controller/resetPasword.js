const mongoose = require('mongoose');
const ResetToken = require('../Models/resetPasswordModel')
const User = require('../Models/usermodel');
const bcrypt = require('bcrypt')
const saltRounds = 10;

exports.resetPassword = async (req, res) => {
    try {
        const { id, token } = req.query;
        const { password } = req.body

        if (!id || !token) {
            return res.status(400).json({ error: "Id or Token Missing" });
        }

        if (!password) {
            return res.status(400).json({ error: "Password is required" })
        }

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const tokenDoc = await ResetToken.findOne({
            user: new mongoose.Types.ObjectId(id),
            token: token.trim()
        });

        if (!tokenDoc || tokenDoc.expiresAt < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        const salt = await bcrypt.genSalt(saltRounds)
        let hashed_password = await bcrypt.hash(password, salt)

        user.password = hashed_password;

        await user.save()

        await ResetToken.deleteOne({ _id: tokenDoc._id })

        return res.status(200).json({ message: "Reset Password Succcessful , Now you can Login" })
    }

    catch (error) {
        console.log("Reset Password error ", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}
