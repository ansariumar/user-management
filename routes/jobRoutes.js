const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Job = require('../models/Job');
// const Applicant = require('../models/Applicant');


const router = express.Router();


/**
 * @swagger
 * /job/addJob:
 *   post:
 *     summary: Add a new job
 *     description: Creates a new job with the provided details. Only accessible by Admin.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               jobType:
 *                 type: string
 *               jobCategory:
 *                 type: string
 *               jobLocation:
 *                 type: string
 *               available:
 *                 type: boolean
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *               requiredQualification:
 *                 type: string
 *               responsibilities:
 *                 type: string
 *               jobDescription:
 *                 type: string
 *               requiredExperience:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *       500:
 *         description: Internal server error
 */

router.post('/addJob', protect, authorize('Admin'), async (req, res) => {                                     
    const { title, jobType, jobCategory, jobLocation, available, requiredSkills, 
    requiredQualification, responsibilities, jobDescription, requiredExperience} = req.body;
    try {
        const newJob = await Job.create({title, jobType, jobCategory, jobLocation, available, requiredSkills, 
        requiredQualification, responsibilities, jobDescription, requiredExperience })

        return res.status(201).json(newJob);
    } catch (err) {
        console.error('Error adding job:', err);
        res.status(500).json({ error: err.message });
    }

    
})


/**
 * @swagger
 * /job:
 *   get:
 *     summary: Get all jobs
 *     description: Retrieves a list of all jobs.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of jobs
 *       500:
 *         description: Internal server error
 */
router.get('/', protect, async (req, res) => {
    const allJobs = await Job.find();

    res.status(200).json(allJobs);
})



/**
 * @swagger
 * /job/{id}:
 *   get:
 *     summary: Get a job by ID
 *     description: Retrieves the details of a job based on the given ID.
 *     tags:
 *       - Jobs
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */

router.get('/:id', async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job){
        return res.status(404).json({message: "job not found"})
    }

    res.status(200).json(job);
})



/**
 * @swagger
 * /job/editjob/{id}:
 *   put:
 *     summary: Update a job by ID
 *     description: Updates the details of a job. Only accessible by Admin.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */

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


/**
 * @swagger
 * /job/deletejob/{id}:
 *   delete:
 *     summary: Delete a job by ID
 *     description: Deletes a job based on the given ID. Only accessible by Admin.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Job deleted successfully
 *       500:
 *         description: Internal server error
 */
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