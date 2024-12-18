const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true
    },
    managerRating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true
    },
    clientRating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true
    },
    overallRating: {
        type: Number,
        required: true
    },
    comments: {
        type: String
    }
})

module.exports = mongoose.model('Feedback', FeedbackSchema);