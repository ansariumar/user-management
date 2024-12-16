const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    publishedDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Announcement', announcementSchema);