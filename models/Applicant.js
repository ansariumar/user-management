const mongoose = require('mongoose');
const Job = require('./Job');
const User = require('./User');

const ApplicantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    jobID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email:{
        type: String,
        required: true
    },
    referenceCode: {
        type: String,
    },
    referenceEmail:{
        type: String,   
    },
    phone: {
        type: String,
        required: true
    },
    cv: {
        type: String,
        required: true
    }
})
// const ApplicantSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     cv: {
//         type: Buffer,
//         required: true
//     }
// })

module.exports = mongoose.model('Applicant', ApplicantSchema);