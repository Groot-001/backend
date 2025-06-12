const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true,
        default: Date.now() + 60 * 60 * 1000
    }
},
    {
        timestamps: true
    })

module.exports = mongoose.model("Token", tokenSchema)