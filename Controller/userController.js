const VerificationTokenModel = require('../Models/verificationTokenModel')
const ResetToken = require('../Models/resetPasswordModel')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const User = require('../Models/usermodel')
const saltrounds = 10
const Token = require('../Models/tokenModel')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/sendEmail')
require('dotenv').config()

exports.register = async (req, res) => {
    try {
        // destructuring from user data 
        let { userName, email, password, department } = req.body

        // FOR USERNAME
        if (!userName) {
            return res.status(400).json({ error: " Username is required " })
        }
        if (!email) {
            return res.status(400).json({ error: "Email is requied !" })
        }
        if (!department) {
            return res.status(400).json({ error: "Department is required" })
        }
        if (!password) {
            return res.status(400).json({ error: "Password is required !" })
        }

        //findone is used to find one element that comes at first after querying
        let user = await User.findOne({ userName })
        if (user) {
            return res.status(400).json({ error: "Username already taken ! " })
        }

        // For clz email only i.e done by restricting the clz domain
        // const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@gniindia\.org$/
        // if (!collegeEmailRegex.test(email)) {
        //     return res.status(400).json({ error: "Only GNI college emails are allowed!" })
        // }

        user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ error: "Email already registered !" })
        }

        let salt = await bcrypt.genSalt(saltrounds)
        let hashed_password = await bcrypt.hash(password, salt)

        user = await User.create({
            userName,
            email,
            password: hashed_password,
            department,
        })

        // Creating a random token for the verification of the user
        const verificationToken = crypto.randomBytes(32).toString('hex')
        //Hex will convert this into hexadecimal , 1 randomBytes = 2hex characters. so 32 will be into 62 characters

        const tokenDoc = new VerificationTokenModel({
            user: user._id,
            token: verificationToken,
            expiresAt: Date.now() + 3600000 // 1 hr
        })

        await tokenDoc.save()

        // Creating the verification link
        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&id=${user._id}`;


        // Email contents
        const subject = "Verify your Campus Collab account";
        const html = `
                  <h2>Hello ${user.userName},</h2>
                  <p>Thank you for registering on Campus Collab!</p>
                  <p>Please click the link below to verify your email:</p>
                  <a href="${verificationLink}" target="_blank">Verify Email</a>
                 <p>This link will expire in 1 hour.</p>`;

        // Sending the email by calling the sendEmail 
        const emailResponse = await sendEmail({
            to: user.email,
            subject,
            html,
        });

        if (!emailResponse.success) {
            return res.status(500).json({
                error: "User registered, but failed to send verification email",
                emailError: emailResponse.message,
            });
        }

        res.status(201).json({ message: "User registered successfully! , Please check your email to verify your account before logging in.", user });
    }
    catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Server error. Please try again." });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email) {
            return res.status(400).json({ error: "Email is required " })
        }
        if (!password) {
            return res.status(400).json({ error: "Password is required" })
        }

        let user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ error: "Email not registered" })
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: "Please check your Email and  Verify your email before Logging in" })
        }

        let passwordcheck = await bcrypt.compare(password, user.password)
        if (!passwordcheck) {
            return res.status(401).json({ error: "Wrong password" })
        }
        // pw checking is done by comapring the hashed pw with the plain pw and internally the hashed pw salt is stored and and the same salt is used for hashing the login pw and compare both which is internally done by the bcrypt compare 


        // Genarate a JWT
        // This is an access token
        const secretKey = process.env.JWT_SECRET
        let { _id, userName, role } = user // Payload i.e userdata
        let accesstoken = jwt.sign({
            _id, userName, role, email
        }, secretKey, { expiresIn: '1h' }
        )

        res.cookie('accesstoken',
            accesstoken,
            {
                // httpOnly: true,
                maxAge: 60 * 60 * 1000,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            })


        // Refresh Token
        const refreshtoken = jwt.sign({
            _id // payload
        },
            secretKey, { expiresIn: '7d' })

        // creating a token
        await Token.create({
            user: user._id,
            token: refreshtoken,
            expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })

        res.cookie('refreshtoken', refreshtoken, {
            // httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({ accesstoken, user })
    }
    catch (error) {
        console.log("Error Logging in" + error)
        return res.status(400).json({ error: "Login Failed" })
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ error: "Email not registered" })
        }

        // This is just a random token generated
        const resetPasswordToken = crypto.randomBytes(32).toString('hex')

        await ResetToken.deleteMany({ user: user._id });

        const tokenDoc = new ResetToken({
            user: user._id,
            token: resetPasswordToken,
            expiresAt: Date.now() + 60 * 60 * 1000
        })

        await tokenDoc.save()

        //Creating a resetPassword link 
        const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?token=${resetPasswordToken}&id=${user._id}`

        const subject = 'Reset Password Link'
        const html = `
        <h2>Hello ${user.userName},</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it. This link will expire in 1 hour.</p>
        <a href="${resetPasswordLink}">Reset Password</a>
        <br/><br/>
        <p>If you did not request this, you can ignore this email.</p>`;

        const emailResponse = await sendEmail({
            to: user.email,
            subject,
            html
        })

        if (!emailResponse.success) {
            return res.status(500).json({
                error: "failed to send verification email",
                emailError: emailResponse.message,
            });
        }

        res.status(200).json({ message: "Reset Pasword link sent to your Email" })
    }
    catch (error) {
        console.log("Forget Password Error", error)
        return res.status(500).json({ error: "Internal server Error" })
    }
}

exports.logout = async (req, res) => {
    try {
        const accesstoken = req.cookies.accesstoken
        const refreshtoken = req.cookies.refreshtoken
        // these two are just strings so we cannot use ._id methods in the string , we need objects for it 

        if (!accesstoken || !refreshtoken) {
            return res.status(401).json({ error: "Access or refresh token missing , User might already logged out" })
        }

        const decoded = jwt.verify(refreshtoken, process.env.JWT_SECRET)
        const refreshtokenexists = await Token.findOne({
            user: decoded._id,
            token: refreshtoken
        })

        if (!refreshtokenexists) {
            return res.status(403).json({ error: "Invalid refresh token" })
        }

        await Token.deleteOne({ _id: refreshtokenexists._id })
        res.clearCookie('accesstoken')
        res.clearCookie('refreshtoken')

        return res.status(200).json({ success: "Logged out successfully" })

    }
    catch (error) {
        console.log("Logging Out error ", error)
        res.status(500).json({ error: "Internal server error" })
    }
}
