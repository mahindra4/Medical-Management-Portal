const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {validateCheckup} = require('../middlewares');
//controllers 
const { 
    getCheckupList, 
    getCheckupDetails,
    getMedicalHistory,
    createCheckup,
    updateCheckup,
    deleteCheckup,
    getPastPrescriptions
} = require('../controllers/checkupController');

const authMiddleware = require("../middlewares/authMiddleware");
const profileMiddleware = require("../middlewares/profileMiddleware");

const roleMap = require("../utils/roleMap");

router.get('/patient/:patientEmail', authMiddleware(roleMap("GET_MEDICAL_HISTORY")), profileMiddleware(true), catchAsync(getMedicalHistory));
router.get('/:id', authMiddleware(roleMap("GET_CHECKUP_DETAILS")), profileMiddleware(true), catchAsync(getCheckupDetails));
router.get('/:email',authMiddleware(roleMap("GET_PAST_PRESCRIPTION")) ,catchAsync(getPastPrescriptions));
router.use(authMiddleware([], false), profileMiddleware(true));

router.get('/',authMiddleware(roleMap("GET_CHECKUP_LIST")), catchAsync(getCheckupList));
router.post('/',authMiddleware(roleMap("CREATE_CHECKUP")), validateCheckup, catchAsync(createCheckup));
router.put('/:id',authMiddleware(roleMap("UPDATE_CHECKUP")), validateCheckup, catchAsync(updateCheckup));
router.delete('/:id',authMiddleware(roleMap("DELETE_CHECKUP")), catchAsync(deleteCheckup));

module.exports = router;
