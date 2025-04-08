const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {
  getAllObservations,
  getObservation,
  updateObservation,
  deleteObservation
} = require('../controllers/observationController');

const authMiddleware = require("../middlewares/authMiddleware");
const profileMiddleware = require("../middlewares/profileMiddleware");
const roleMap = require("../utils/roleMap");

// Observation routes
router.get('/', 
  authMiddleware(roleMap("GET_OBSERVATION")), 
  profileMiddleware(true), 
  catchAsync(getAllObservations)
);

router.get('/:id', 
  authMiddleware(roleMap("GET_OBSERVATION")), 
  profileMiddleware(true), 
  catchAsync(getObservation)
);

router.put('/:id', 
  authMiddleware(roleMap("UPDATE_OBSERVATION")), 
  profileMiddleware(true), 
  catchAsync(updateObservation)
);

router.delete('/:id', 
  authMiddleware(roleMap("DELETE_OBSERVATION")), 
  profileMiddleware(true), 
  catchAsync(deleteObservation)
);

module.exports = router;