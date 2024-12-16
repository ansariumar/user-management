const express = require('express');
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
/** 
* @swagger
* components:
*   schemas:
*     Announcement:
*       type: object
*       properties:
*         _id:
*           type: string
*         topic:
*           type: string
*         description:
*           type: string
*         publishedDate:
*           type: string
*           format: date-time
*     CreateAnnouncement:
*       type: object
*       required:
*         - topic
*         - description
*       properties:
*         topic:
*           type: string
*         description:
*           type: string
*     Error:
*       type: object
*       properties:
*         error:
*           type: string
*/

/** 
 * @swagger
 * /announcement:
 *   get:
 *     summary: List announcements
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:    
 *             schema:
 *               type: object
 *               properties:
 *                 announcements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalAnnouncements:
 *                   type: integer
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
*/
router.get('/', protect, async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;

        const announcements = await Announcement.find()
            .skip(skip)
            .limit(limit)
            .sort({ publishedDate: -1 });

        const totalAnnouncements = await Announcement.countDocuments();

        return res.status(200).json({
            announcements,
            currentPage: page,
            totalPages: Math.ceil(totalAnnouncements / limit),
            totalAnnouncements
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message })
    }
})

/**
 * @swagger
 * /announcement:
 *   post:
 *     summary: Create an announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnnouncement'
 *     responses:
 *       '201':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', protect, authorize("HR", "Admin"), async (req, res) => {
    const { topic, description } = req.body;

    try {
        const announcement = await Announcement.create({
            topic,
            description
        });

        res.status(201).json({ message: "Announcement Created", data: announcement });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message })
    }
})


/**
 * @swagger
 * /announcement/{id}:
 *   put:
 *     summary: Create an announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnnouncement'
 *     responses:
 *       '200':
 *         description: Successful Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', protect, authorize("HR", "Admin"), async (req, res) => {
    const { topic, description } = req.body;

    if (!topic || !description) {
        return res.status(400).json({ error: 'Please provide topic and description' });
    }

    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

        announcement.topic = topic;
        announcement.description = description;

        const updatedAnnouncement = await announcement.save();
        return res.status(200).json({ message: 'Announcement updated', data: updatedAnnouncement });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message })
    }

})


/**
 * @swagger
 * /announcement/{id}:
 *  delete:
 *   summary: Delete an announcement
 *   tags: [Announcements]
 *   security:
 *    - bearerAuth: []
 *   parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   responses:
 *       '200':
 *         description: Successful Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       '404':
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

        return res.status(200).json({ message: `Announcement with title "${announcement.topic}" was deleted` });
    } catch (err) {
        console.err(err);
        return res.status(500).json({ error: err.message })
    }
})
module.exports = router;