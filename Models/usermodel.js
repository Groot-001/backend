const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
        // enum is used so that we can restrict others to login
    },
    department: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false,
    }
},
    {
        timestamps: true
    })

module.exports = mongoose.model("User", userSchema)