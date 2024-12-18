const express = require('express');
const Feedback = require('../../models/project/Feedback');

const router = express.Router();


router.post('/', async (req, res) => {
    const { projectName, managerRating, clientRating, comments } = req.body;

    if (!projectName || !managerRating || !clientRating) {
        return res.status(400).json({ message: 'Please provide all the required fields' });
    }

    const avgRating = (parseInt(managerRating) + parseInt(clientRating)) / 2;

    try {
        const feedback = await Feedback.create({
            projectName,
            managerRating,
            clientRating,
            overallRating: avgRating,
            comments
        })
        
        return res.status(201).json({ message: 'The feedback was submitted', feedback });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;