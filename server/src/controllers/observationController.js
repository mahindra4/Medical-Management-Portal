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
        patientName: obs.checkup?.Patient?.name || '',
        doctorName: obs.checkup?.Doctor?.name || '',
        staffName: obs.checkup?.Staff?.name || '',
        date: obs.checkup?.date?.toISOString().split('T')[0] || '',
        temperature: obs.checkup?.temperature ?? '',
        bloodPressure: obs.checkup?.bloodPressure || '',
        pulseRate: obs.checkup?.pulseRate ?? '',
        spO2: obs.checkup?.spO2 ?? '',
        diagnosis: obs.checkup?.diagnosis || '',
        symptoms: obs.checkup?.symptoms || '',
        medicineDetails: obs.observation?.medicine?.brandName 
          ? `${obs.observation.medicine.brandName} (${obs.observation.dosage}/${obs.observation.frequency})`
          : '',
        totalQuantity: obs.observation 
          ? (obs.observation.dailyQuantity || 0) * (obs.observation.days || 0)
          : '',
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
// In your observationController.js
const getObservation = async (req, res, next) => {
  try {
    const observation = await prisma.patientUnderObs.findUnique({
      where: { id: req.params.id },
      include: {
        checkup: {
          include: {
            Patient: true,
            Doctor: true,
            Staff: true,
            CheckupMedicine: {
              include: {
                Medicine: true
              }
            }
          }
        },
        observation: {
          include: {
            medicine: true
          }
        }
      }
    });

    if (!observation) {
      throw new ExpressError("Observation not found", 404);
    }

    // Format response with ALL needed fields
    const responseData = {
      // Basic info
      id: observation.id,
      date: observation.checkup.date,
      status: observation.isUnderObservation ? "Active" : "Inactive",
      
      // People
      patientName: observation.checkup.Patient.name,
      doctorName: observation.checkup.Doctor?.name,
      staffName: observation.checkup.Staff.name,
      
      // Vitals
      bloodPressure: observation.checkup.bloodPressure,
      spO2: observation.checkup.spO2,
      pulseRate: observation.checkup.pulseRate,
      temperature: observation.checkup.temperature,
      
      // Medical info
      diagnosis: observation.checkup.diagnosis,
      symptoms: observation.checkup.symptoms,
      referredDoctor: observation.checkup.referredDoctor,
      referredHospital: observation.checkup.referredHospital,
      
      // Medicines
      medicines: observation.checkup.CheckupMedicine.map(med => ({
        brandName: med.Medicine.brandName,
        dosage: med.dosage,
        frequency: med.frequency,
        days: med.days,
        dailyQuantity: med.dailyQuantity
      })),
      
      // Observation-specific meds
      observationMedicines: observation.observation ? [{
        brandName: observation.observation.medicine?.brandName,
        dosage: observation.observation.dosage,
        frequency: observation.observation.frequency,
        days: observation.observation.days,
        dailyQuantity: observation.observation.dailyQuantity
      }] : []
    };

    res.status(200).json(responseData);
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
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "Observation ID is required"
      });
    }

    // First check if the observation exists with all related data
    const observation = await prisma.patientUnderObs.findUnique({
      where: { id },
      include: {
        observation: true,
        checkup: true
      }
    });

    if (!observation) {
      return res.status(404).json({
        ok: false,
        message: "Observation not found"
      });
    }

    // Process everything in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Return stock if observation has medicine
      if (observation.observation?.medicineId) {
        const totalQuantity = observation.observation.dailyQuantity * observation.observation.days;
        
        // First find the stock record for this medicine
        const stock = await prisma.stock.findFirst({
          where: { medicineId: observation.observation.medicineId }
        });

        if (!stock) {
          console.error(`Stock record not found for medicineId: ${observation.observation.medicineId}`);
          throw new ExpressError("Stock record not found for this medicine", 404);
        }

        // Verify we have enough outQuantity to decrement
        if (stock.outQuantity < totalQuantity) {
          console.error(`Insufficient outQuantity in stock. Current: ${stock.outQuantity}, Trying to decrement: ${totalQuantity}`);
          throw new ExpressError("Insufficient outQuantity in stock to reverse this observation", 400);
        }

        // Now update using the stock's id
        await prisma.stock.update({
          where: { id: stock.id },
          data: {
            outQuantity: { decrement: totalQuantity },
            stock: { increment: totalQuantity }
          }
        });
      }

      // 2. First delete the patient under observation record (which references observationDetails)
      await prisma.patientUnderObs.delete({
        where: { id: observation.id }
      });

      // 3. Then delete the observation details (now that nothing references it)
      if (observation.observationId) {
        await prisma.observationDetails.delete({
          where: { id: observation.observationId }
        });
      }

      return { success: true };
    });

    return res.status(200).json({
      ok: true,
      message: "Observation deleted successfully",
    });

  } catch (error) {
    console.error("Delete observation error:", error);
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        ok: false,
        message: "Cannot delete due to existing references. Please delete referencing records first.",
        error: error.message
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        ok: false,
        message: "Record not found",
        error: error.message
      });
    }
    
    return res.status(500).json({
      ok: false,
      message: "Failed to delete observation",
      error: error.message
    });
  }
};

module.exports = {
  getAllObservations,
  getObservation,
  updateObservation,
  deleteObservation
};