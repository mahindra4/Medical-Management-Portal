const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const authMiddleware = require("../middlewares/authMiddleware");
const profileMiddleware = require("../middlewares/profileMiddleware");

const roleMap = require("../utils/roleMap");

const {deletePatientVitals, getPatientVitals, savePatientVitals, getPatientVitalsList} = require('../controllers/patientVitalController.js');

// router.use(authMiddleware([], false), profileMiddleware(true));

router.post("/save", authMiddleware(roleMap("GET_PATIENT_VITAL_LIST")), catchAsync(savePatientVitals));
router.get("/:id", authMiddleware(roleMap("CREATE_PATIENT_VITALS")), catchAsync(getPatientVitals));
router.get("/", authMiddleware(roleMap("PATIENT_VITAL_LIST")), catchAsync(getPatientVitalsList));
router.delete("/:id", authMiddleware(roleMap("DELETE_PATIENT_VITALS")), catchAsync(deletePatientVitals));

// router.get("/", catchAsync(getPatientVitalsList));
// router.post("/save", catchAsync(savePatientVitals));
// router.get("/:id", catchAsync(getPatientVitals));
// router.delete("/:id", catchAsync(deletePatientVitals));

module.exports = router;