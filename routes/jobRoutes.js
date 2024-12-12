const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Job = require('../models/Job');
// const Applicant = require('../models/Applicant');

const router = express.Router();

router.post('/addJob', protect, authorize('Admin'), async (req, res) => {                                     
    const { title, jobType, jobCategory, jobLocation, available, requiredSkills, 
    requiredQualification, responsibilities, jobDescription, requiredExperience} = req.body;

    const newJob = await Job.create({title, jobType, jobCategory, jobLocation, available, requiredSkills, 
    requiredQualification, responsibilities, jobDescription, requiredExperience })

    return res.status(201).json(newJob);
})

router.get('/job', async (req, res) => {
    const allJobs = await Job.find();

    res.status(200).json(allJobs);
})


router.get('/job/:id', async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job){
        return res.status(404).json({message: "job not found"})
    }

    res.status(200).json(job);
})

router.put('/editjob/:id', protect, authorize('Admin'), async (req, res) => {

    try {
        const jobTobeUpdated = await Job.findById(req.params.id)

        if (!jobTobeUpdated){
            return res.status(404).json({message: "job not found"})
        }

        const updatedJob = await Job.findByIdAndUpdate(jobTobeUpdated, req.body, {new: true, runValidators: true})

        return res.status(200).json({message: "updated", updatedJob})

    } catch(err) {
        console.error('Error updating job:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
    
})

router.delete("/deletejob/:id", protect, authorize('Admin'), async(req, res) => {

    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id)
        return res.status(204).send({message: `The job ${deletedJob.title} was deleted`})
    } catch (e) {
        console.error('Error deleting job:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router;