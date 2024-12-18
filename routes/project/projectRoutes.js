const express = require('express');
const Project = require('../../models/project/Project');
const Employee = require('../../models/Employee');
const { protect, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/search', protect, async (req, res) => {
    if (!req.query.name) return res.status(400).json({ message: "Please provide a name to search for." });
    try {
        const names = await findByName(req.query.name);
        if (!names) return res.status(404).json({ message: "No employees found." });
        return res.status(200).json({ names });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
})

router.post('/', protect, authorize("Admin", "HR"), async (req, res) => {
    const { clientName, projectName, description, startDate, endDate, priority, assignedEmployees } = req.body;

    if(!clientName || !startDate || !endDate || !assignedEmployees) return res.status(400).json({ message: "Please provide all required fields." });

    try {
        const project = await Project.create({
            clientName,
            projectName,
            description,
            startDate,
            endDate,
            priority,
            assignedEmployees,
            createdBy: req.emp._id
        })    

        const populatedProject = await project.populate('assignedEmployees', 'name -_id') 
        return res.status(201).json({ populatedProject })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
})


async function findByName(name) {
    const names = await Employee.find({ name: { $regex: name, $options: "i" } }).select("name");
    if (names.length === 0) return null;
    return names;
}


module.exports = router;