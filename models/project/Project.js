const mongoose = require('mongoose');
const Employee = require('../Employee');

const ProjectSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        unique: true,
        default: function () {
            return generateProjectId(this.projectName);
        }
    },
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: "No description provided."
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0 // Progress bar shows completion percentage
    },
    status: {
        type: String,
        enum: ["not started", "in progress", "completed", "on hold"],
        default: "not started",
        lowercase: true
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    assignedEmployees: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
        validate: {
            validator: async function (v) {
                const employee = await Employee.find({ _id: { $in: v } })
                return employee.length === 0? false : true;
            },
            message: "One or more of the employees assigned to the project do not exist."
        }
    },
    clientMessages: [
        {
            senderName: { type: String, required: true },
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // The HR or admin who created the project
        required: true
    }
}, { timestamps: true });


// ProjectSchema.pre('validate', async function (next) {

// })

function generateProjectId(projectName) {
    const prefix = "PRJ";
    console.log(projectName);
    const shortName = projectName
        .split(" ") // Split project name into words
        .map(word => word.slice(0, 3).toUpperCase()) // Take first 3 letters of each word
        .join(""); // Combine letters
    const year = new Date().getFullYear(); // Current year
    const randomNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    return `${prefix}-${shortName}-${year}-${randomNum}`;
}

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
