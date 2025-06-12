const mongoose = require('mongoose')

const resetPasswordSchema = new mongoose.Schema({
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
        required: true,
        index: { expires: 0 }
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('ResetToken', resetPasswordSchema)