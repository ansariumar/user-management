const mongoose = require('mongoose');
const Job = require('./Job');
const Employee = require('./Employee');

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
        ref: 'Employee',
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


module.exports = mongoose.model('Applicant', ApplicantSchema);