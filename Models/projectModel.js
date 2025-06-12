const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    roles: {
        type: [String], // array of string
        default: []
    },
    pendingRequests: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            role: String,
            requestedAt: { type: Date, default: Date.now }
        }
    ],
    members: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            role: String,
            joinedAt: { type: Date, default: Date.now }
        }
    ]

},
    { timestamps: true }
)

module.exports = mongoose.model("ProjectModel", projectSchema)