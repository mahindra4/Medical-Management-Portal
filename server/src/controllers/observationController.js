const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ExpressError = require("../utils/ExpressError");

// @desc    Get all observations
// route    GET /api/observations
// @access  Private (Admin, Doctor, Paramedical)
const getAllObservations = async (req, res, next) => {
  try {
    const observations = await prisma.patientUnderObs.findMany({
      where: {
        isUnderObservation: true
      },
      include: {
        checkup: {
          include: {
            Patient: {
              select: {
                name: true
              }
            },
            Doctor: {
              select: {
                name: true
              }
            },
            Staff: {
              select: {
                name: true
              }
            }
          }
        },
        observation: {
          include: {
            medicine: {
              select: {
                brandName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedObservations = observations.map(obs => {
      // Debug log to inspect the raw data
      console.log('Raw observation data:', obs);
      
      return {
        id: obs.id,
        patientName: obs.checkup?.Patient?.name || 'N/A',
        doctorName: obs.checkup?.Doctor?.name || 'N/A',
        staffName: obs.checkup?.Staff?.name || 'N/A',
        date: obs.checkup?.date?.toISOString().split('T')[0] || 'N/A',
        temperature: obs.checkup?.temperature ?? 'N/A',
        bloodPressure: obs.checkup?.bloodPressure || 'N/A',
        pulseRate: obs.checkup?.pulseRate ?? 'N/A',
        spO2: obs.checkup?.spO2 ?? 'N/A',
        diagnosis: obs.checkup?.diagnosis || 'N/A',
        symptoms: obs.checkup?.symptoms || 'N/A',
        medicineDetails: obs.observation?.medicine?.brandName 
          ? `${obs.observation.medicine.brandName} (${obs.observation.dosage}/${obs.observation.frequency})`
          : 'N/A',
        totalQuantity: obs.observation 
          ? (obs.observation.dailyQuantity || 0) * (obs.observation.days || 0)
          : 'N/A',
        status: obs.isUnderObservation ? "Active" : "Inactive"
      };
    });

    // Debug log to inspect formatted data
    console.log('Formatted observations:', formattedObservations);

    res.status(200).json({
      ok: true,
      data: formattedObservations,
      message: "Observations retrieved successfully"
    });
  } catch (error) {
    console.error("Observation fetch error:", error);
    next(new ExpressError("Failed to fetch observations", 500));
  }
};

// @desc    Get single observation
// route    GET /api/observations/:id
// @access  Private (Admin, Doctor, Paramedical)
const getObservation = async (req, res, next) => {
  try {
    // Extract and validate ID
    let observationId = req.params.id;
    
    // Handle case where ID might be in format "id^index"
    if (typeof observationId === 'string' && observationId.includes('^')) {
      observationId = observationId.split('^')[0];
    }
    
    // Handle case where ID might be an object (from malformed requests)
    if (typeof observationId === 'object') {
      if (observationId.id) {
        observationId = observationId.id;
      } else {
        throw new ExpressError("Invalid observation ID format - received object without id property", 400);
      }
    }

    // Validate UUID format
    if (typeof observationId !== 'string' || !observationId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      throw new ExpressError(`Invalid observation ID format: ${observationId}`, 400);
    }

    const observation = await prisma.patientUnderObs.findUnique({
      where: { id: observationId },
      include: {
        checkup: {
          include: {
            Patient: true,
            Doctor: true,
            Staff: true
          }
        },
        observation: {
          include: {
            medicine: {
              select: {
                brandName: true
              }
            }
          }
        }
      }
    });

    if (!observation) {
      throw new ExpressError("Observation not found", 404);
    }

    // Format response similar to checkupController
    const responseData = {
      id: observation.id,
      patientId: observation.checkup.Patient.id,
      patientName: observation.checkup.Patient.name,
      doctorName: observation.checkup.Doctor?.name || 'N/A',
      staffName: observation.checkup.Staff.name,
      date: observation.checkup.date.toISOString().split('T')[0],
      temperature: observation.checkup.temperature || 'N/A',
      bloodPressure: observation.checkup.bloodPressure || 'N/A',
      pulseRate: observation.checkup.pulseRate || 'N/A',
      spO2: observation.checkup.spO2 || 'N/A',
      diagnosis: observation.checkup.diagnosis || 'N/A',
      symptoms: observation.checkup.symptoms || 'N/A',
      medicineDetails: {
        medicine: observation.observation.medicine?.brandName || 'N/A',
        dosage: observation.observation.dosage || 'N/A',
        frequency: observation.observation.frequency || 'N/A',
        dailyQuantity: observation.observation.dailyQuantity || 0,
        days: observation.observation.days || 0,
        totalQuantity: observation.observation.dailyQuantity * observation.observation.days || 0,
        availableQuantity: observation.observation.availableQuantity || 0
      },
      isActive: observation.isUnderObservation,
      checkupId: observation.checkupId,
      observationId: observation.observationId
    };

    res.status(200).json({
      ok: true,
      data: responseData,
      message: "Observation retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching observation:", {
      error: error.message,
      params: req.params
    });
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
      include: { 
        observation: true,
        checkup: true
      }
    });

    if (!currentObs) {
      throw new ExpressError("Observation not found", 404);
    }

    // 2. Calculate stock difference
    const oldTotal = currentObs.observation.dailyQuantity * currentObs.observation.days;
    const newTotal = dailyQuantity * days;
    const stockDiff = newTotal - oldTotal;

    // 3. Check stock if increasing medication
    if (stockDiff > 0 && currentObs.observation.medicineId) {
      const stock = await prisma.stock.findFirst({
        where: { medicineId: currentObs.observation.medicineId }
      });

      if (!stock || stock.stock < stockDiff) {
        throw new ExpressError("Insufficient stock for this update", 400);
      }
    }

    // 4. Update in transaction
    const result = await prisma.$transaction([
      prisma.observationDetails.update({
        where: { id: currentObs.observationId },
        data: { 
          dosage, 
          frequency, 
          dailyQuantity, 
          days,
          updatedAt: new Date() 
        }
      }),
      ...(currentObs.observation.medicineId ? [
        prisma.stock.update({
          where: { medicineId: currentObs.observation.medicineId },
          data: {
            outQuantity: { increment: stockDiff },
            stock: { decrement: stockDiff }
          }
        })
      ] : [])
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
      include: { 
        observation: true,
        checkup: true
      }
    });

    if (!observation) {
      throw new ExpressError("Observation not found", 404);
    }

    // 2. Delete in transaction
    await prisma.$transaction([
      ...(observation.observation.medicineId ? [
        prisma.stock.update({
          where: { medicineId: observation.observation.medicineId },
          data: {
            outQuantity: { decrement: observation.observation.dailyQuantity * observation.observation.days },
            stock: { increment: observation.observation.dailyQuantity * observation.observation.days }
          }
        })
      ] : []),
      prisma.observationDetails.delete({
        where: { id: observation.observationId }
      }),
      prisma.checkup.update({
        where: { id: observation.checkupId },
        data: {
          PatientUnderObs: {
            delete: true
          }
        }
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