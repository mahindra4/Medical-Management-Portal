const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const authMiddleware = require("../middlewares/authMiddleware");
const profileMiddleware = require("../middlewares/profileMiddleware");

const roleMap = require("../utils/roleMap");

const {getPatientVitals, savePatientVitals, getPatientVitalsList} = require('../controllers/patientVitalController.js');

// router.use(authMiddleware([], false), profileMiddleware(true));

router.post("/save", authMiddleware(roleMap("GET_PATIENT_VITAL_LIST")), catchAsync(savePatientVitals));
router.get("/:id", authMiddleware(roleMap("CREATE_PATIENT_VITALS")), catchAsync(getPatientVitals));
router.get("/", authMiddleware(roleMap("PATIENT_VITAL_LIST")), catchAsync(getPatientVitalsList));
// router.get("/", catchAsync(getPatientVitalsList));

// router.post("/save", catchAsync(savePatientVitals));
// router.get("/:id", catchAsync(getPatientVitals));

module.exports = router;