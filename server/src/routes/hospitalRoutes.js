const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const authMiddleware = require("../middlewares/authMiddleware");
const profileMiddleware = require("../middlewares/profileMiddleware");

const roleMap = require("../utils/roleMap");

const getHospitalList = require('../controllers/hospitalController.js');

router.use(authMiddleware([], false), profileMiddleware(true));

router.get("/", authMiddleware(roleMap("GET_HOSPITAL_LIST")), catchAsync(getHospitalList));

module.exports = router;