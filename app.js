const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc')

const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicantRoutes = require('./routes/applicantRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const timeSheetRoutes = require('./routes/timeSheetRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const payrollRoutes = require('./routes/payrollRoutes')
const announcementRoutes = require('./routes/announcementRoutes');
const feedbackRoutes = require('./routes/project/feedbackRoutes');
const projectRoutes = require('./routes/project/projectRoutes')

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
// const fs = require("fs");
// const deepmerge = require("deepmerge")

// const swagger1 = JSON.parse(fs.readFileSync("./swagger1.json", 'utf-8'))
// const swagger2 = JSON.parse(fs.readFileSync("./swagger2.json", "utf-8"))

// const combinedSwagger = deepmerge(swagger1, {
//   paths: swagger2.paths,
//   tags: swagger2.tags,
//   components: swagger2.components
// })

// fs.writeFileSync('./combinedAPI.json', JSON.stringify(combinedSwagger, null, 2));
const options = {
	definition : {
		openapi: "3.0.0",
		info: {
			title: "User Management API",
			version: "1.0.0",
			description: "API for managing Employees, HR, and Admins with role-based access.",
		},
		servers: [
			{
				url: "http://localhost:5000/api",
			},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/users', userRoutes);
app.use('/api/emp', employeeRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/applicant', applicantRoutes );
app.use('/api/leave', leaveRoutes);
app.use('/api/timeSheet', timeSheetRoutes );
app.use('/api/shift', shiftRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/project/feedback', feedbackRoutes);
app.use('/api/project', projectRoutes);
app.use('./api/payroll', payrollRoutes)

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

module.exports = app;
