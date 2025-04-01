const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const authMiddleware = require("../middlewares/authMiddleware");
const profileMiddleware = require("../middlewares/profileMiddleware");

const roleMap = require("../utils/roleMap");

const {getDiagnosisSymptomsList, getDiagnosisList} = require('../controllers/diagnosisController')

router.use(authMiddleware([], false), profileMiddleware(true));

router.get('/', authMiddleware(roleMap("GET_DIAGNOSIS_LIST")), catchAsync(getDiagnosisList));
router.get('/symptoms', authMiddleware(roleMap("GET_DIAGNOSIS_SYMPTOMS_LIST")), catchAsync(getDiagnosisSymptomsList));

module.exports = router;