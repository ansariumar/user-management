const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title']
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        required: true,
    },
    jobCategory: {                          //IT, HR, Marketing, frontend, backend, fullstack, etc
        type: String,
        required: [true, 'Please provide a category']
    },
    jobLocation: {
        type: String,
        required: [true, 'Please provide a location']
    },
    available: {
        type: Boolean,
        default: true
    },
    requiredSkills: {
        type: [String],
        required: [true, 'Please provide required skills']
    },
    requiredQualification: {
        type: String,
        required: [true, 'Please provide a qualification']
    },
    responsibilities: {
        type: [String],
        required: [true, 'Please provide responsibilities']
    },
    jobDescription: {
        type: String,
        required: [true, "please provide the desctiption"]
    },
    requiredExperience: {
        type: String,
        required: [true, 'Please provide the required experience']
    }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);