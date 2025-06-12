const mongoose = require('mongoose');
const ResetToken = require('../Models/resetPasswordModel')

exports.validateResetToken = async (req, res) => {
    try {
        const { id, token } = req.query;

        if (!id || !token) {
            return res.status(400).json({ error: "Id or Token Missing" })
        }

        const tokenDoc = await ResetToken.findOne({
            user: new mongoose.Types.ObjectId(id),
            token: token.trim()
        });

        if (!tokenDoc || tokenDoc.expiresAt < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        return res.status(200).json({ message: "Token is valid" });
    }
    catch (error) {
        console.error("Token validation error", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
