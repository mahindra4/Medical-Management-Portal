const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

// Controllers
const {
    getVisitingSpecialistList,
    getVisitingSpecialist,
    createVisitingSpecialist,
    updateVisitingSpecialist,
    deleteVisitingSpecialist,
    getTodayVisitingSpecialists
} = require('../controllers/visitingSpecialistController.js');

const authMiddleware = require("../middlewares/authMiddleware");
const profileMiddleware = require("../middlewares/profileMiddleware");
const roleMap = require("../utils/roleMap.js");

// Middleware to validate visiting specialist data
const validateVisitingSpecialist = (req, res, next) => {
    const { name, specialization, availableTime, availableDays } = req.body;
    
    if (!name || !specialization || !availableTime || !availableDays) {
        return res.status(400).json({
            ok: false,
            data: null,
            message: "Name, specialization, available time, and available days are required",
        });
    }
    
    next();
};

// Route to get today's visiting specialists - accessible by all authenticated users
router.get('/today', authMiddleware([], false), catchAsync(getTodayVisitingSpecialists));

// Routes that require administrator privileges
router.post('/', authMiddleware(roleMap("CREATE_SPECIALIST")), validateVisitingSpecialist, catchAsync(createVisitingSpecialist));
router.get('/', authMiddleware(roleMap("GET_SPECIALIST_LIST")), catchAsync(getVisitingSpecialistList));
router.get('/:id', authMiddleware(roleMap("GET_SPECIALIST")), catchAsync(getVisitingSpecialist));
router.put('/:id', authMiddleware(roleMap("UPDATE_SPECIALIST")), validateVisitingSpecialist, catchAsync(updateVisitingSpecialist));
router.delete('/:id', authMiddleware(roleMap("DELETE_SPECIALIST")), catchAsync(deleteVisitingSpecialist));

module.exports = router;