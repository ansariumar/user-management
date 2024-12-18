const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Applicant = require('../models/Applicant');
const Job = require('../models/Job');
// const jwt = require('jsonwebtoken');
const fs = require('fs');
// const path = require('path');
const multer = require('multer');

const router = express.Router();


/**
 * @swagger
 * components:
 *  securitySchemes:
 *   bearerAuth:
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT
 *   schemas:
 *     Applicant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         jobID:
 *           type: string
 *         userID:
 *           type: string
 *         email:
 *           type: string
 *         referenceCode:
 *           type: string
 *         referenceEmail:
 *           type: string
 *         phone:
 *           type: string
 *         cv:
 *           type: string
 *     ApplyForJobRequest:
 *       type: object
 *       required:
 *         - name
 *         - jobID
 *         - email
 *         - referenceCode
 *         - referenceEmail
 *         - phone
 *         - cv
 *       properties:
 *         name:
 *           type: string
 *         jobID:
 *           type: string
 *         email:
 *           type: string
 *         referenceCode:
 *           type: string
 *         referenceEmail:
 *           type: string
 *         phone:
 *           type: string
 *         cv:
 *           type: string
 *           format: binary
 *     UpdateApplicantRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         jobID:
 *           type: string
 *         email:
 *           type: string
 *         referenceCode:
 *           type: string
 *         referenceEmail:
 *           type: string
 *         phone:
 *           type: string
 *         cv:
 *           type: string
 *           format: binary
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

const storage = multer.diskStorage({            //MUlTER CONFIGURATION
    destination: './uploads/', // Directory where files will be saved

    filename: (req, file, cb) => {
        const uniqueFileName = `${Date.now()}-${file.originalname}`;

        cb(null, uniqueFileName); // Pass the unique file name to multer
    }
});

const fileFilter = (req, file, cb) => {         //pdf FIELS ONLY
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/**
 * @swagger
 * /applicant:
 *   get:
 *     summary: Get all applicants
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Applicants
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Applicant'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get('/', protect, authorize('HR', 'Admin'), async (req, res) => {
    const applicants = await Applicant.find();
    return res.status(200).json(applicants);
})

/**
 * @swagger
 * /applicant/apply:
 *   post:
 *     summary: Apply for a job
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Applicants
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ApplyForJobRequest'
 *     responses:
 *       '201':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Applicant'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Job not found
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
router.post('/apply',protect, authorize('Employee'), upload.single('cv'), async (req, res) => {
    console.log(req.body);
    console.log(req.body.jobID);
    try {
        const job = await Job.findById(req.body.jobID); // Check if the job exists
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Ensure file is uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'CV is required and must be a PDF' });
        }

        // Create new applicant
        const newApplicant = await Applicant.create({
            name: req.body.name,
            jobID: req.body.jobID,
            userID: req.emp._id,
            email: req.body.email,
            referenceCode: req.body.referenceCode,
            referenceEmail: req.body.referenceEmail,
            phone: req.body.phone,
            cv: req.file.path, // Save the file path
        });

        res.status(201).json(newApplicant);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /applicant/my:
 *   get:
 *     summary: Get all the job applied
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Applicants
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Applicant'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my', protect, authorize('Employee'), async (req, res) => {
    const empID = req.emp._id;

    try {
        let applicant = await Applicant.find({ userID: empID }).populate('jobID');

        if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
        
        return res.status(200).json(applicant);
    } catch(err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
})

/**
 * @swagger
 * /applicant/{id}:
 *   get:
 *     summary: Get a specific applicant
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Applicants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:    
 *             schema:
 *               $ref: '#/components/schemas/Applicant'
 *       '404':
 *         description: Applicant not found
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
router.get('/:id',protect, authorize('HR', 'Admin'), async (req, res) => {
    try {
        const applicant = await Applicant.findById(req.params.id).populate('jobID');
        if (!applicant) {
            return res.status(404).json({ error: 'Applicant not found' });
        }
        return res.status(200).json(applicant);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
    
})







/**
 * @swagger
 * /applicant/{id}:
 *   put:
 *     summary: Update an applicant
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Applicants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApplicantRequest'
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Applicant'
 *       '404':
 *         description: Applicant or Job not found
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
router.put('/:id',protect, authorize('Employee'), upload.single("cv") ,async (req, res) => {
   try {
    const exsistingApplication = await Applicant.findById(req.params.id);
    if (!exsistingApplication) {
        return res.status(404).json({ error: 'Applicant not found' });
    }

    const job = await Job.findById(req.body.jobID);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    const UpdatedData = {
        name: req.body.name,
        jobID: req.body.jobID,
        email: req.body.email,
        referenceCode: req.body.referenceCode,
        referenceEmail: req.body.referenceEmail,
        phone: req.body.phone,
    }

    if (req.file) {
        UpdatedData.cv = req.file.path;
    }

    const updatedApplicant = await Applicant.findByIdAndUpdate(
        req.params.id, 
        UpdatedData, 
        { new: true, runValidators: true }
    );

    return res.status(200).json(updatedApplicant);
   } catch {
    console.err(err);
    return res.status(500).json({ error: err.message });
   }
});


/**
 * @swagger
 *  /applicant/{id}:
 *   delete:
 *     summary: Delete an applicant
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Applicants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '404':
 *         description: Applicant not found
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
router.delete('/:id',protect, authorize('HR', 'Admin'), async (req, res) => {
    try {

        const deletedApplicant = await Applicant.findByIdAndDelete(req.params.id);

        if (deletedApplicant.cv) {
            const cvDelete =  fs.unlinkSync(deletedApplicant.cv);
            console.log(cvDelete + "this is ithe glauie of acoag dele e");
        }
        

        if (!deletedApplicant) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({ message: `Job deleted successfully`  });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message});
    }
});



// router.get('/test', async (req, res) => {

//     const pdf = fs.readFileSync('./routes/umar_ansari.pdf');

//     try {
//         const newApplicant = await Applicant.create({ name: "umar", cv: pdf });
//         return res.status(200)
//     } catch (e) {
//         console.log(e);
//         return res.status(500).json({ error: "Server Error" });
//     }


// })

// router.get('/getApplicant/:name', async (req, res) => {
//     const applicant = await Applicant.findOne({ name: req.params.name });
//     if (!applicant) {
//         return res.status(404).json({ error: "Applicant not found" });
//     }
//     const extracted_path = './extracted_umar_ansari.pdf';
//     fs.writeFileSync('./extracted_umar_ansari.pdf', applicant.cv);
//     return res.status(200).json({ message: "Applicant Found" });
// })

module.exports = router;