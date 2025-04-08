const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ExpressError = require("../utils/ExpressError");

// @desc    Get all observations
// route    GET /api/observations
// @access  Private (Admin, Doctor, Paramedical)
const getAllObservations = async (req, res, next) => {
  try {
    const observations = await prisma.patientUnderObs.findMany({
      include: {
        checkup: {
          include: {
            Patient: true,
            Doctor: true
          }
        },
        observation: {
          include: {
            Medicine: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedObservations = observations.map(obs => ({
      id: obs.id,
      patientId: obs.checkup.Patient.id,
      patientName: obs.checkup.Patient.name,
      doctorName: obs.checkup.Doctor?.name,
      date: obs.checkup.date.toISOString().split('T')[0],
      medicine: obs.observation.Medicine.brandName,
      dosage: obs.observation.dosage,
      frequency: obs.observation.frequency,
      days: obs.observation.days,
      isActive: obs.isUnderObservation
    }));

    res.status(200).json({
      ok: true,
      data: formattedObservations,
      message: "Observations retrieved successfully"
    });
  } catch (error) {
    next(new ExpressError("Failed to fetch observations", 500));
  }
};

// @desc    Get single observation
// route    GET /api/observations/:id
// @access  Private (Admin, Doctor, Paramedical)
const getObservation = async (req, res, next) => {
  try {
    const observation = await prisma.patientUnderObs.findUnique({
      where: { id: req.params.id },
      include: {
        checkup: {
          include: {
            Patient: true,
            Doctor: true
          }
        },
        observation: {
          include: {
            Medicine: true
          }
        }
      }
    });

    if (!observation) {
      throw new ExpressError("Observation not found", 404);
    }

    res.status(200).json({
      ok: true,
      data: {
        id: observation.id,
        patientId: observation.checkup.Patient.id,
        patientName: observation.checkup.Patient.name,
        doctorName: observation.checkup.Doctor?.name,
        date: observation.checkup.date.toISOString().split('T')[0],
        diagnosis: observation.checkup.diagnosis,
        medicine: observation.observation.Medicine.brandName,
        dosage: observation.observation.dosage,
        frequency: observation.observation.frequency,
        dailyQuantity: observation.observation.dailyQuantity,
        days: observation.observation.days,
        isActive: observation.isUnderObservation
      },
      message: "Observation retrieved successfully"
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update observation
// route    PUT /api/observations/:id
// @access  Private (Admin, Doctor)
const updateObservation = async (req, res, next) => {
  const { id } = req.params;
  const { dosage, frequency, dailyQuantity, days } = req.body;

  try {
    // 1. Get current observation
    const currentObs = await prisma.patientUnderObs.findUnique({
      where: { id },
      include: { observation: true }
    });

    if (!currentObs) {
      throw new ExpressError("Observation not found", 404);
    }

    // 2. Calculate stock difference
    const oldTotal = currentObs.observation.dailyQuantity * currentObs.observation.days;
    const newTotal = dailyQuantity * days;
    const stockDiff = newTotal - oldTotal;

    // 3. Check stock if increasing medication
    if (stockDiff > 0) {
      const stock = await prisma.stock.findFirst({
        where: { medicineId: currentObs.observation.medicineId }
      });

      if (stock.stock < stockDiff) {
        throw new ExpressError("Insufficient stock for this update", 400);
      }
    }

    // 4. Update in transaction
    const result = await prisma.$transaction([
      prisma.observationDetails.update({
        where: { id: currentObs.observationId },
        data: { dosage, frequency, dailyQuantity, days }
      }),
      prisma.stock.update({
        where: { medicineId: currentObs.observation.medicineId },
        data: {
          outQuantity: { increment: stockDiff },
          stock: { decrement: stockDiff }
        }
      })
    ]);

    res.status(200).json({
      ok: true,
      data: result[0], // Return updated observation details
      message: "Observation updated successfully"
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete observation
// route    DELETE /api/observations/:id
// @access  Private (Admin)
const deleteObservation = async (req, res, next) => {
  try {
    // 1. Get observation first
    const observation = await prisma.patientUnderObs.findUnique({
      where: { id: req.params.id },
      include: { observation: true }
    });

    if (!observation) {
      throw new ExpressError("Observation not found", 404);
    }

    // 2. Delete in transaction
    await prisma.$transaction([
      prisma.stock.update({
        where: { medicineId: observation.observation.medicineId },
        data: {
          outQuantity: { decrement: observation.observation.dailyQuantity * observation.observation.days },
          stock: { increment: observation.observation.dailyQuantity * observation.observation.days }
        }
      }),
      prisma.observationDetails.delete({
        where: { id: observation.observationId }
      }),
      prisma.patientUnderObs.delete({
        where: { id: req.params.id }
      })
    ]);

    res.status(200).json({
      ok: true,
      message: "Observation deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllObservations,
  getObservation,
  updateObservation,
  deleteObservation
};