const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Timesheet = require('../models/timeSheet/TimeSheet');
const Schedule = require('../models/timeSheet/Schedule');
const Task = require('../models/timeSheet/Task');

const router = express.Router();

/**
 * @swagger
 * components:
 *  securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 *
 *  schemas: 
 *   Task:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *       project:
 *         type: string
 *       title:
 *         type: string
 *       description:
 *         type: string
 *       assignedTo:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           name:
 *             type: string
 *           email:
 *             type: string
 *       dueDate:
 *         type: string
 *         format: date
 *       priority:
 *         type: string
 *         enum: ['Low', 'Medium', 'High']
 *       status:
 *         type: string
 *         enum: ['Pending', 'In Progress', 'Completed']
 *
 *   ErrorResponse:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *       error:
 *         type: string
 */

/**
 * @swagger
 * components:
 *  securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 *
 *  schemas:
 *   Timesheet:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *       user:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *           name:
 *             type: string
 *           email:
 *             type: string
 *       project:
 *         type: string
 *       task:
 *         type: string
 *       assignedBy:
 *         type: string
 *       week:
 *         type: string
 *       hours:
 *         type: number
 *       createdAt:
 *         type: string
 *         format: date-time
 *       updatedAt:
 *         type: string
 *         format: date-time
 *
 *   ErrorResponse:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *       error:
 *         type: string
*/

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: The task managing api
 *   - name: Timesheet
 *     description: The timesheet managing api
 */

router.get('/', (req, res) => {
    res.json({ message: "welcome" })
});


/**
 * @swagger
 * /timesheet:
 *  post:
 *     summary: Create a new timesheet entry
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Timesheet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               project:
 *                 type: string
 *               task:
 *                 type: string
 *               assignedBy:
 *                 type: string
 *               week:
 *                 type: string
 *               hours:
 *                 type: number
 *     responses:
 *       '201':
 *         description: Timesheet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Timesheet'
 *       '400':
 *         description: Missing email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/', async (req, res) => {
    const { email, project, task, assignedBy, week, hours } = req.body;
    console.log(email)
    if (!email) return res.send(400).json({ message: 'Employee email is required' });
    const user = await Employee.findOne({ email: email });
    if (!user) return res.status(404).json({ message: 'Employee not found' });

    console.log(user)
    const userID = user._id;
    console.log(userID);
    try {
        const timesheet = await Timesheet.create({
            user: userID,
            project,
            task,
            assignedBy,
            week,
            hours,
        });

        res.status(201).json(timesheet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating timesheet', error: error.message });
    }
});


/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update a timesheet entry
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Timesheet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project:
 *                 type: string
 *               task:
 *                 type: string
 *               assignedBy:
 *                 type: string
 *               week:
 *                 type: string
 *               hours:
 *                 type: number
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: Timesheet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 timesheet:
 *                   $ref: '#/components/schemas/Timesheet'
 *       '404':
 *         description: Timesheet or Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", protect, authorize("HR", "Admin"), async (req, res) => {
    const { project, task, assignedBy, week, hours, email } = req.body;

    try {
        const timesheet = await Timesheet.findById(req.params.id).populate('user');

        let msg = "Timesheet updated successfully";
        if (email || timesheet.user.email !== email) {               //If the project was assigned to another person, then we update the timesheet objectID
            const emp = await Employee.findOne({ email });
            if (!emp) return res.status(404).json({ message: 'Employee not found' });
            timesheet.user = emp._id;
            msg = "The project was assigned to another person";
        }

        if (!timesheet) return res.status(404).json({ message: 'Timesheet not found' });

        timesheet.project = project;
        timesheet.task = task;
        timesheet.assignedBy = assignedBy;
        timesheet.week = week;
        timesheet.hours = hours;

        await timesheet.save();
        res.status(200).json({message:msg, timesheet});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating timesheet', error: error.message });
    }
})


/**
 * @swagger
 * /my:
 *   get:
 *     summary: Get timesheets for the current employee
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Timesheet
 *     responses:
 *       '200':
 *         description: Successfully retrieved employee's timesheets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Timesheet'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/my", protect, authorize("Employee"), async (req, res) => {
    const userID = req.user._id;
    try {
        const timesheets = await Timesheet.find({ user: userID });
        res.status(200).json(timesheets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching timesheets', error: error.message });
    }
})


/**
 * @swagger
 * /all:
 *   get:
 *     summary: Get all timesheets (HR/Admin only)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Timesheet
 *     responses:
 *       '200':
 *         description: Successfully retrieved all timesheets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Timesheet'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/all", protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const timesheets = await Timesheet.find().populate('user', 'name email');
        res.status(200).json(timesheets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching timesheets', error: error.message });
    }    
});

// --------------------------------------TASK MANAGEMENT--------------------------------------

/**
 * @swagger
 * /timesheet/task:
 *   post:
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project
 *               - title
 *               - email
 *             properties:
 *               project:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               email:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: ['Low', 'Medium', 'High']
 *     responses:
 *       '201':
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.post("/task", protect, authorize("HR", "Admin"), async (req, res) => {
    const { project, title, description, email, dueDate, priority } = req.body;

    if (!project || !title || !email ) return res.status(400).json({ message: 'Project, title and assignedTo fields are required' });


    try {
        const user = await Employee.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Employee with the given email doesnt exitst' });
        const assignedTo = user._id;

        const task = await Task.create({
            project,
            title,
            description,
            assignedTo,
            dueDate,
            priority
        });

        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
});

/**
 * @swagger
 * /timesheet/task/my:
 *   get:
 *     summary: Get tasks assigned to the current employee
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tasks
 *     responses:
 *       '200':
 *         description: Successfully retrieved tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/task/my", protect, authorize("Employee"), async (req, res) => {
    const userID = req.emp._id;

    try {
        const tasks = await Task.find({ assignedTo: userID });
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
})

/**
 * @swagger
 * /timesheet/editTask/{id}:
 *   get:
 *     summary: Get details of a specific task
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/editTask/:id", protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('assignedTo', 'name email');
        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching task', error: error.message });
    }
})

/**
 * @swagger
 * /timesheet/task/all:
 *   get:
 *     summary: Get all tasks (HR/Admin only)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tasks
 *     responses:
 *       '200':
 *         description: Successfully retrieved all tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * 
 */

router.get("/task/all", protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo', 'name email');
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
})

/**
 * @swagger
 * /task/{id}:
 *   put:
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               email:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: ['Low', 'Medium', 'High']
 *               status:
 *                 type: string
 *                 enum: ['Pending', 'In Progress', 'Completed']
 *     responses:
 *       '200':
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       '404':
 *         description: Task or Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/task/:id', protect, authorize("HR", "Admin"), async (req, res) => {
    const { project, title, description, email, dueDate, priority, status } = req.body;

    try {
        const task = await Task.findById(req.params.id).populate('assignedTo');

        let msg = "Task updated successfully";
        if (email || task.assignedTo.email !== email) {               //If the project was assigned to another person, then we update the task objectID
            const emp = await Employee.findOne({ email });
            if (!emp) return res.status(404).json({ message: 'Employee not found' });
            task.assignedTo = emp._id;
            msg = "The task was assigned to another person";
        }

        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.project = project;
        task.title = title;
        task.description = description;
        task.dueDate = dueDate;
        task.priority = priority;
        task.status = status;

        await task.save();
        res.status(200).json({message:msg, task});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
})


/**
 * @swagger
 * /task/delete/{id}:
 *   delete:
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '404':
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/task/delete/:id", protect, authorize("HR", "Admin"), async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await task.deleteOne();
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
})

module.exports = router;