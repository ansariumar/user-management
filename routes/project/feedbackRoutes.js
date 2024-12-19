const express = require('express');
const Feedback = require('../../models/project/Feedback');
const Project = require('../../models/project/Project');
const { protect, authorize } = require('../../middleware/authMiddleware');
const router = express.Router();



/**
 * @swagger
 * /project/feedback/{projectID}:
 *   post:
 *     summary: Submit feedback for a project
 *     description: Creates feedback for a specific project by ID.
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectName:
 *                 type: string
 *               managerRating:
 *                 type: integer
 *                 example: 4
 *               clientRating:
 *                 type: integer
 *                 example: 5
 *               comments:
 *                 type: string
 *                 example: Great project!
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 feedback:
 *                   type: object
 *       400:
 *         description: Missing project ID or required fields
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 *
 */

router.post('/:projectID', protect, authorize("HR", "Admin"), async (req, res) => {
    const { projectName, managerRating, clientRating, comments } = req.body;
    if (!req.params.projectID) return res.status(400).json({ message: 'Please provide the project ID' });

    if (!projectName || !managerRating || !clientRating) {
        return res.status(400).json({ message: 'Please provide all the required fields' });
    }

    const avgRating = (parseInt(managerRating) + parseInt(clientRating)) / 2;

    try {
        const project = await Project.findById(req.params.projectID);
        if (!project) return res.status(404).json({ message: 'The project does not exist' });
        console.log(project)
        const feedback = await Feedback.create({
            projectName,
            projectID: project._id,
            managerRating,
            clientRating,
            overallRating: avgRating,
            comments
        })

        return res.status(201).json({ message: 'The feedback was submitted', feedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


/**
 * @swagger
 * /project/feedback/{projectID}:
 *  put:
 *     summary: Update feedback for a project
 *     description: Updates the feedback for a specific project by ID.
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectName:
 *                 type: string
 *               managerRating:
 *                 type: integer
 *               clientRating:
 *                 type: integer
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       400:
 *         description: Missing project ID
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 *
 */
router.put('/:projectID', protect, authorize("HR", "Admin"), async (req, res) => {
    const { projectID } = req.params;   //projectID is an objectID
    const updates = req.body;

    if (!projectID) return res.status(400).json({ success: "false", message: 'Please provide the project ID' });

    try {
        const feedback = await Feedback.findOne({ projectID: projectID });
        if(!feedback) return res.status(404).json({ success: "false", message: 'Feedback not found' });
        
        if (updates.projectName) feedback.projectName = updates.projectName;
        if (updates.managerRating) feedback.managerRating = updates.managerRating;
        if (updates.clientRating) feedback.clientRating = updates.clientRating;
        if (updates.comments) feedback.comments = updates.comments;

        if (feedback.managerRating || feedback.clientRating) {
            feedback.overallRating = (parseInt(feedback.managerRating) + parseInt(feedback.clientRating)) / 2;
        }

        const updatedFeedback = await feedback.save();

        return res.status(200).json({ success: "true", message: 'Feedback updated', updatedFeedback });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: "false", message: err.message });
    }

})


/**
 * @swagger
 * /project/feedback/{projectID}:
 *   delete:
 *     summary: Delete feedback for a project
 *     description: Deletes feedback for a specific project by ID.
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *       400:
 *         description: Missing project ID
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:projectID', protect, authorize("HR", "Admin"), async (req, res) => {
    const { projectID } = req.params;

    if (!projectID) return res.status(400).json({ success: "false", message: 'Please provide the project ID' });

    try {
        const feedback = await Feedback.findOne({ projectID: projectID });
        if (!feedback) return res.status(404).json({ success: "false", message: 'Feedback not found' });

        await feedback.deleteOne();

        return res.status(200).json({ success: "true", message: 'Feedback deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: "false", message: err.message });
    }
})

/**
 * @swagger
 * /project/feedback/:
 *   get:
 *     summary: Get all feedback
 *     description: Retrieves all feedback with pagination.
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of feedback per page
 *     responses:
 *       200:
 *         description: List of feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalFeedbacks:
 *                   type: integer
 *                 feedbacks:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 *
 */
router.get('/', protect, async(req, res) => {
    try {
        const page = req.query.page? parseInt(req.query.page): 1;
        const limit = req.query.limit? parseInt(req.query.limit): 10;
        const skip = (page - 1) * limit;

        const feedbacks = await Feedback.find()
            .limit(limit)
            .skip(skip)
            .populate('projectID', 'projectName')
            .sort({ createdAt: -1 });
        
        const totalFeedbacks = await Feedback.countDocuments();

        return res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalFeedbacks / limit),
            totalFeedbacks,
            feedbacks
        })
    }catch (err) {
        console.error(err);
        res.status(500).json({ success: "false" ,message: err.message });
    }
})



/**
 * @swagger
 * /project/feedback/{projectID}:
 *   get:
 *     summary: Get feedback for a specific project
 *     description: Retrieves feedback by project ID.
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Feedback details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 feedback:
 *                   type: object
 *       400:
 *         description: Missing project ID
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 */
router.get('/:projectID', protect, async(req, res) => {
    const { projectID } = req.params;

    if (!projectID) return res.status(400).json({ success: "false", message: 'Please provide the project ID' });

    try {
        const feedback = await Feedback.findOne({ projectID: projectID }).populate("projectID");
        if (!feedback) return res.status(404).json({ success: "false", message: 'Feedback not found' });

        return res.status(200).json({ success: "true", feedback });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: "false", message: err.message });
    }
})

module.exports = router;