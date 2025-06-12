const jwt = require('jsonwebtoken')
const Token = require('../Models/tokenModel')
const User = require('../Models/usermodel')
require('dotenv').config()

exports.refreshaccesstoken = async (req, res) => {
    try {
        // checking refreshtoken in cookies data
        let tokenfromcookie = req.cookies.refreshtoken

        if (!tokenfromcookie) {
            return res.status(401).json({ error: "Please login again " })
        }

        // verify the refresh token using secrey key and returns the payload if valid
        let decoded
        try {
            decoded = jwt.verify(tokenfromcookie, process.env.JWT_SECRET)
        }
        catch {
            return res.status(403).json({ error: "invalid or token expires" })
        }

        // checking refreshtoken in db
        const token = await Token.findOne({ user: decoded._id, token: tokenfromcookie });
        if (!token) {
            return res.status(403).json({ error: "Invalid or expired refresh token" });
        }

        // checking user
        let user = await User.findById(decoded._id)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // generate new accesstoken
        const secret = process.env.JWT_SECRET
        const newAccessToken = jwt.sign({
            _id: user._id,
            userName: user.userName,
            role: user.role,
            email: user.email
        }, secret, { expiresIn: '1h' }
        )

        // set the new token in the cookies
        res.cookie('accesstoken', newAccessToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        })

        // send response
        res.status(200).json({
            acccesstoken: newAccessToken,
            user: {
                _id: user._id,
                userName: user.userName,
                role: user.role,
                email: user.email
            }
        })
    }
    catch (error) {
        console.log("Refresh token error", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

