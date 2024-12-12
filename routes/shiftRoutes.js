const express = require('express');
const Employee = require('../models/Employee');
const Shift = require('../models/Shift');

const router = express.Router();

router.get('/', async (req, res) => {
    console.log("hi")
})

module.exports = router;