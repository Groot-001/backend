const Verify = require('../Models/verificationTokenModel')
const User = require('../Models/usermodel')
const mongoose = require('mongoose');

exports.verifyEmail = async (req, res) => {
    try {
        const { id, token } = req.query;
        // Used for get requests

        if (!id || !token) {
            return res.status(400).json({ error: "Invalid or token missing" })
        }

        // Verifying the token and use
        const tokenDoc = await Verify.findOne({
            user: new mongoose.Types.ObjectId(id), // cast here
            token: token.trim()
        });

        if (!tokenDoc) {
            return res.status(201).json({ message: "Email already verified or token has expired" });
        }

        // Checking the expiry of the token
        if (tokenDoc.expiresAt < Date.now()) {
            await Verify.deleteOne({ _id: tokenDoc._id });
            return res.status(400).json({ error: "Token has expired. Please register again." });
        }

        // Mark user as verified
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.isVerified = true; // Make sure 'verified' field exists in user schema
        await user.save();

        // Remove token from DB after successful verification
        await Verify.deleteOne({ _id: tokenDoc._id });

        res.status(200).json({ message: "Email verified successfully. You can now log in!" });
    }
    catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }

}