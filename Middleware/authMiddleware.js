const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.verifyAccessToken = async (req, res, next) => {
    try {
        // checking access token in the cookie
        let accesstokenfromcookie = req.cookies.accesstoken
        if (!accesstokenfromcookie) {
            return res.status(401).json({ error: "Token missing , Please login again " })
        }

        // verifying access token and verify() methods returns the patload of the token
        let decoded
        try {
            decoded = jwt.verify(accesstokenfromcookie, process.env.JWT_SECRET)
        }
        catch (error) {
            return res.status(403).json({ error: "Invalid token" })
        }

        // Attaching user info into req.user so that the user data can be accessable in whole request
        req.user = decoded
        next() 

    }
    catch (error) {
        console.log("Access token middleware Error ", error)
        res.status(500).json({ error: "Internal server Error" })
    }
}