const mongoose = require('mongoose')

const verificationTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('VerificationToken', verificationTokenSchema)