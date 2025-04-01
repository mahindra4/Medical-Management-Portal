// routes/observationRoutes.js
const express = require('express');
const router = express.Router();
const observationController = require('../controllers/observationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, observationController.createObservation);
router.get('/patient/:patientId', authMiddleware, observationController.getPatientObservations);
router.get('/:id', authMiddleware, observationController.getObservationDetails);
router.patch('/:id', authMiddleware, observationController.updateObservationStatus);
router.patch('/detail/:id', authMiddleware, observationController.updateObservationDetail);
router.delete('/:id', authMiddleware, observationController.deleteObservation);

module.exports = router;