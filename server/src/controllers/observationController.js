// controllers/observationController.js
const prisma = require('../prisma');
const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

const createObservation = async (req, res, next) => {
  try {
    const { patientId, checkupId, details } = req.body;
    
    // Validate input
    if (!patientId || !details || !Array.isArray(details)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid input data');
    }

    // Create observation
    const observation = await prisma.patientObservation.create({
      data: {
        patientId,
        checkupId,
        details: {
          create: details.map(detail => ({
            medicineId: detail.medicineId,
            equipmentType: detail.equipmentType,
            dosage: detail.dosage,
            frequency: detail.frequency,
            totalDailyQuantity: parseInt(detail.totalDailyQuantity) || 1,
            remainingQuantity: parseInt(detail.totalDailyQuantity) || 1
          }))
        }
      },
      include: {
        details: true
      }
    });

    // Update stock if medicine is used
    for (const detail of details) {
      if (detail.medicineId) {
        await prisma.stock.update({
          where: { medicineId: detail.medicineId },
          data: {
            outQuantity: {
              increment: parseInt(detail.totalDailyQuantity) || 1
            }
          }
        });
      }
    }

    res.status(httpStatus.CREATED).json(observation);
  } catch (error) {
    next(error);
  }
};

const getPatientObservations = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const observations = await prisma.patientObservation.findMany({
      where: { patientId, status: 'ACTIVE' },
      include: {
        details: {
          include: {
            medicine: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });
    res.json(observations);
  } catch (error) {
    next(error);
  }
};

const getObservationDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const observation = await prisma.patientObservation.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            medicine: true
          }
        },
        patient: true
      }
    });
    
    if (!observation) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Observation not found');
    }
    
    res.json(observation);
  } catch (error) {
    next(error);
  }
};

const updateObservationDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { usedQuantity } = req.body;
    
    if (!usedQuantity || usedQuantity <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid quantity');
    }
    
    // Get current detail
    const detail = await prisma.observationDetail.findUnique({
      where: { id }
    });
    
    if (!detail) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Observation detail not found');
    }
    
    // Check remaining quantity
    if (usedQuantity > detail.remainingQuantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough remaining quantity');
    }
    
    // Update detail
    const updatedDetail = await prisma.observationDetail.update({
      where: { id },
      data: {
        remainingQuantity: {
          decrement: usedQuantity
        }
      },
      include: {
        medicine: true
      }
    });
    
    // Update stock if medicine was used
    if (detail.medicineId) {
      await prisma.stock.update({
        where: { medicineId: detail.medicineId },
        data: {
          outQuantity: {
            increment: usedQuantity
          }
        }
      });
    }
    
    res.json(updatedDetail);
  } catch (error) {
    next(error);
  }
};

const updateObservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid status');
    }
    
    const observation = await prisma.patientObservation.update({
      where: { id },
      data: { status }
    });
    
    res.json(observation);
  } catch (error) {
    next(error);
  }
};

const deleteObservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First delete all details to maintain referential integrity
    await prisma.observationDetail.deleteMany({
      where: { observationId: id }
    });
    
    await prisma.patientObservation.delete({
      where: { id }
    });
    
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createObservation,
  getPatientObservations,
  getObservationDetails,
  updateObservationDetail,
  updateObservationStatus,
  deleteObservation
};