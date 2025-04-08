const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ExpressError = require("../utils/ExpressError");
const formatTimeFromISO = require("../utils/formatTimeFromISO");

// @desc    Get Checkup Details
// route    GET /api/checkup/:id
// @access  Private (Admin)
const getCheckupDetails = async (req, res, next) => {
  const { id } = req.params;
  const checkup = await prisma.checkup.findUnique({
    where: {
      id: id,
    },
    include: {
      Patient: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      Staff: {
        select: {
          name: true,
        },
      },
      Doctor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      CheckupMedicine: {
        include: {
          Medicine: {
            select: {
              id: true,
              brandName: true,
            },
          },
        },
      },
    },
  });

  if (!checkup) {
    throw new ExpressError("Prescription does not exist", 404);
  }

  const restructuredCheckup = {
    id: checkup?.id,
    patientName: checkup.Patient?.name,
    patientEmail: checkup.Patient?.email,
    patientId: checkup.Patient?.id,
    doctorName: checkup.Doctor?.name,
    doctorEmail: checkup.Doctor?.email,
    doctorId: checkup.Doctor?.id,
    staffName: checkup.Staff?.name,
    date: checkup.date.toISOString().split("T")[0],
    time: formatTimeFromISO(checkup.date),
    diagnosis: checkup?.diagnosis,
    symptoms: checkup?.symptoms,
    referredDoctor: checkup?.referredDoctor,
    referredHospital: checkup?.referredHospital,
    temperature: checkup?.temperature,
    bloodPressure: checkup?.bloodPressure,
    pulseRate: checkup?.pulseRate,
    spO2: checkup.spO2,
    checkupMedicines: checkup.CheckupMedicine.map((medicine) => ({
      id: medicine?.id,
      brandName: medicine.Medicine?.brandName,
      dosage: medicine?.dosage,
      quantity: medicine?.quantity,
      stock: medicine.Medicine?.Stock?.stock,
    })),
  };
  // console.log("restructuredCheckup : ", restructuredCheckup);
  return res.status(200).json({
    ok: true,
    data: restructuredCheckup,
    message: "Prescription Details retrieved successfully",
  });
};

// @desc    Get Checkup List
// route    GET /api/checkup
// @access  Private (Admin)

const getCheckupList = async (req, res, next) => {
  const checkupList = await prisma.checkup.findMany({
    include: {
      Patient: {
        select: {
          name: true,
        },
      },
      Staff: {
        select: {
          name: true,
        },
      },
      Doctor: {
        select: {
          name: true,
        },
      },
    },
  });
  // for (const checkup of checkupList) {
  //   console.log(formatTimeFromISO(checkup.date));
  // }

  const restructuredCheckupList = checkupList.map((checkup) => ({
    id: checkup?.id,
    patientName: checkup.Patient?.name,
    doctorName: checkup.Doctor?.name,
    staffName: checkup.Staff?.name,
    date: checkup.date.toISOString().split("T")[0],
    time: formatTimeFromISO(checkup.date),
    diagnosis: checkup?.diagnosis,
    symptoms: checkup?.symptoms,
  }));

  return res.status(200).json({
    ok: true,
    data: restructuredCheckupList,
    message: "Prescription List retrieved successfully",
  });
};

// @desc    Fetch Medical Records
// route    POST /api/checkup
// @access  Private (Admin)

const getMedicalHistory = async (req, res, next) => {
  const { patientEmail } = req.params; // Assuming patientId is passed in request params
  console.log("here :", patientEmail);
  try {
    const patient = await prisma.patient.findUnique({
      where: {
        email: patientEmail,
      },
    });

    if (!patient) {
      return res.status(404).json({
        ok: false,
        message: "Patient not found",
      });
    }

    const medicalHistory = await prisma.checkup.findMany({
      where: {
        patientId: patient.id, // Use patient ID for filtering
      },
      include: {
        Patient: {
          select: {
            name: true,
            email: true,
          },
        },
        Staff: {
          select: {
            name: true,
          },
        },
        Doctor: {
          select: {
            name: true,
          },
        },
      },
    });

    const restructuredMedicalHistory = medicalHistory.map((checkup) => ({
      id: checkup?.id,
      patientName: checkup.Patient?.name,
      doctorName: checkup.Doctor?.name,
      staffName: checkup.Staff?.name,
      date: checkup.date.toISOString().split("T")[0],
      time: formatTimeFromISO(checkup.date),
      diagnosis: checkup?.diagnosis,
      symptoms: checkup?.symptoms,
    }));

    return res.status(200).json({
      ok: true,
      data: restructuredMedicalHistory,
      message: "Medical history retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching medical history:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch medical history",
    });
  }
};

// @desc    Create Checkup Records
// route    POST /api/checkup
// @access  Private (Admin)

const createCheckup = async (req, res, next) => {
  const {
    patientId,
    doctorId,
    staffEmail,
    date,
    diagnosis,
    symptoms,
    temperature,
    bloodPressure,
    pulseRate,
    spO2,
    checkupMedicines,
    referredDoctor,
    referredHospital,
    isUnderObservation,
    observationDetails
  } = req.body;

  console.log("req.body : ", req.body);

  // Validate patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: patientId }
  });
  if (!patient) {
    throw new ExpressError("Patient does not exist", 404);
  }

  // Validate doctor exists if provided
  if (doctorId) {
    const doctor = await prisma.staff.findUnique({
      where: { id: doctorId, role: "DOCTOR" }
    });
    if (!doctor) {
      throw new ExpressError("Doctor does not exist", 404);
    }
  }

  // Validate staff exists
  const staff = await prisma.staff.findUnique({
    where: { email: staffEmail }
  });
  if (!staff) {
    throw new ExpressError("Logged in Staff does not exist", 404);
  }

  // Validate checkup medicines stock
  let stockRecords = [];
  for (const [idx, medicine] of checkupMedicines.entries()) {
    if (medicine.quantity < 1) {
      throw new ExpressError(
        `Quantity should be greater than 0 for medicine with ID ${medicine.medicineId} in ITEM ${idx + 1}`,
        400
      );
    }
    
    // Fixed: Changed obsItem.medicineId to medicine.medicineId
    const stockRecord = await prisma.stock.findFirst({
      where: { medicineId: medicine.medicineId }
    });
    
    if (!stockRecord) {
      throw new ExpressError(
        `Stock record not found for medicine with ID ${medicine.medicineId} in ITEM ${idx + 1}`,
        404
      );
    }
    
    if (stockRecord.stock < medicine.quantity) {
      throw new ExpressError(
        `Stock not sufficient for medicine with ID ${medicine.medicineId} in ITEM ${idx + 1}`,
        400
      );
    }
    stockRecords.push(stockRecord);
  }

  // Validate observation medicines if enabled
  if (isUnderObservation ) {
    if (!observationDetails || !observationDetails.length) {
      throw new ExpressError("Observation details are required when patient is under observation", 400);
    }

    for (const [idx, obsItem] of observationDetails.entries()) {
      if (!obsItem.medicineId) {
        throw new ExpressError(`Medicine ID missing in observation item ${idx + 1}`, 400);
      }
      if (obsItem.days < 1) {
        throw new ExpressError(`Days should be > 0 in observation item ${idx + 1}`, 400);
      }

      const stockRecord = await prisma.stock.findFirst({
        where: { medicineId: obsItem.medicineId }
      });
      
      if (!stockRecord) {
        throw new ExpressError(
          `Stock record not found for observation medicine ${obsItem.medicineId}`,
          404
        );
      }
      
      if (stockRecord.stock < (obsItem.dailyQuantity * obsItem.days)) {
        throw new ExpressError(
          `Insufficient stock for observation medicine ${obsItem.medicineId}. ` +
          `Required: ${obsItem.dailyQuantity * obsItem.days}, Available: ${stockRecord.stock}`,
          400
        );
      }
      
      // Store the stock ID for later use
      observationDetails[idx].stockId = stockRecord.id;
    }
  }

  // Create everything in a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // 1. Create the base checkup
    let timeInfo = new Date().toISOString().split('T')[1];
    const createdCheckup = await prisma.checkup.create({
      data: {
        patientId,
        doctorId,
        staffId: staff.id,
        date: date + "T" + timeInfo,
        diagnosis,
        symptoms,
        temperature: parseFloat(temperature),
        bloodPressure,
        pulseRate: parseInt(pulseRate),
        spO2: parseFloat(spO2),
        referredDoctor,
        referredHospital,
        CheckupMedicine: {
          create: checkupMedicines,
        },
      },
    });

    // 2. Handle observation if enabled
    if (isUnderObservation) {
      // Create all observation details
      const createdObsDetails = await Promise.all(
        observationDetails.map(obsItem => 
          prisma.observationDetails.create({
            data: {
              medicineId: obsItem.medicineId,
              dosage: obsItem.dosage,
              frequency: obsItem.frequency,
              dailyQuantity: obsItem.dailyQuantity,
              days: obsItem.days,
              availableQuantity: obsItem.availableQty,
            }
          })
        )
      );

      // Link to PatientUnderObs
      await prisma.patientUnderObs.create({
        data: {
          checkupId: createdCheckup.id,
          observationId: createdObsDetails[0].id,
          isUnderObservation: true,
        }
      });

      // Update stock for observation medicines using stockId
      await Promise.all(
        observationDetails.map(obsItem =>
          prisma.stock.update({
            where: { id: obsItem.stockId }, // Changed from medicineId to stockId
            data: {
              outQuantity: { increment: obsItem.dailyQuantity * obsItem.days },
              stock: { decrement: obsItem.dailyQuantity * obsItem.days },
            }
          })
        )
      );
    }

    // 3. Update stock for checkup medicines
    await Promise.all(
      checkupMedicines.map((medicine, idx) =>
        prisma.stock.update({
          where: { id: stockRecords[idx].id },
          data: {
            outQuantity: { increment: medicine.quantity },
            stock: { decrement: medicine.quantity },
          }
        })
      )
    );

    return createdCheckup;
  });

  return res.status(200).json({
    ok: true,
    data: result,
    message: "Prescription added successfully",
  });
};
// @desc    Update Checkup Record
// route    PUT /api/checkup/:id
// @access  Private (Admin)
const updateCheckup = async (req, res, next) => {
  const { id } = req.params;
  const {
    patientId,
    doctorId,
    staffEmail,
    date,
    diagnosis,
    symptoms,
    temperature,
    bloodPressure,
    pulseRate,
    spO2,
    checkupMedicines,
    referredDoctor,
    referredHospital,
    isUnderObservation,
    observationDetails
  } = req.body;

  // Validate patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: patientId }
  });
  if (!patient) {
    throw new ExpressError("Patient does not exist", 404);
  }

  // Validate doctor exists if provided
  if (doctorId) {
    const doctor = await prisma.staff.findUnique({
      where: { id: doctorId, role: "DOCTOR" }
    });
    if (!doctor) {
      throw new ExpressError("Doctor does not exist", 404);
    }
  }

  // Validate staff exists
  const staff = await prisma.staff.findUnique({
    where: { email: staffEmail }
  });
  if (!staff) {
    throw new ExpressError("Logged in Staff does not exist", 404);
  }

  // Get existing checkup medicines
  const pastCheckupMedicines = await prisma.checkupMedicine.findMany({
    where: { checkupId: id }
  });

  // Validate checkup medicines stock
  let stockCheckupMedicinesRecords = [];
  for (const [idx, medicine] of checkupMedicines.entries()) {
    if (medicine.quantity < 1) {
      throw new ExpressError(
        `Quantity should be greater than 0 for medicine with ID ${medicine.medicineId} in ITEM ${idx + 1}`,
        400
      );
    }

    const stockRecord = await prisma.stock.findFirst({
      where: { medicineId: medicine.medicineId }
    });
    if (!stockRecord) {
      throw new ExpressError(
        `Stock record not found for medicine with ID ${medicine.medicineId} in ITEM ${idx + 1}`,
        404
      );
    }

    const pastCheckupMedicine = pastCheckupMedicines.find(
      m => m.medicineId === medicine.medicineId
    );
    
    // If newly added medicine, check full quantity
    if (!pastCheckupMedicine && stockRecord.stock < medicine.quantity) {
      throw new ExpressError(
        `Stock not sufficient for medicine with ID ${medicine.medicineId} in ITEM ${idx + 1}`,
        400
      );
    }

    stockCheckupMedicinesRecords.push(stockRecord);
  }

  // Validate existing medicines being reduced
  let stockPastCheckupMedicinesRecords = [];
  for (const [idx, pastMedicine] of pastCheckupMedicines.entries()) {
    const currStock = await prisma.stock.findFirst({
      where: { medicineId: pastMedicine.medicineId }
    });
    if (currStock) stockPastCheckupMedicinesRecords.push(currStock);

    const newMedicine = checkupMedicines.find(m => m.medicineId === pastMedicine.medicineId);
    if (newMedicine && newMedicine.quantity > pastMedicine.quantity) {
      const diff = newMedicine.quantity - pastMedicine.quantity;
      if (currStock.stock < diff) {
        throw new ExpressError(
          `Stock not sufficient for medicine with ID ${pastMedicine.medicineId} in ITEM ${idx + 1}`,
          400
        );
      }
    }
  }

  // Validate observation medicines if enabled
  let observationStockRecord = null;
  if (isUnderObservation) {
    if (!observationDetails || !observationDetails.length) {
      throw new ExpressError("Observation details are required when patient is under observation", 400);
    }
    const existingObservation = await prisma.patientUnderObs.findFirst({
      where: { checkupId: id },
      include: { observation: true }
    });

    // Find stock record for observation medicine
    observationStockRecord = await prisma.stock.findFirst({
      where: { medicineId: observationDetails[0].medicineId }
    });
    
    if (!observationStockRecord) {
      throw new ExpressError(
        `Stock record not found for observation medicine ${observationDetails[0].medicineId}`,
        404
      );
    }

    // Calculate required quantity
    const requiredQty = observationDetails[0].dailyQuantity * observationDetails[0].days;
    let availableQty = observationStockRecord.stock;

    // If updating existing observation, add back previous quantity
    if (existingObservation?.observation?.medicineId === observationDetails[0].medicineId) {
      availableQty += existingObservation.observation.dailyQuantity * existingObservation.observation.days;
    }

    if (availableQty < requiredQty) {
      throw new ExpressError(
        `Insufficient stock for observation medicine ${observationDetails[0].medicineId}. ` +
        `Required: ${requiredQty}, Available: ${availableQty}`,
        400
      );
    }
  }

  // Process everything in a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // 1. Update stock for checkup medicines
    const updateDataCheckupMedicines = checkupMedicines.map((medicine, idx) => {
      const pastMedicine = pastCheckupMedicines.find(m => m.medicineId === medicine.medicineId);
      const diff = pastMedicine ? medicine.quantity - pastMedicine.quantity : medicine.quantity;
      
      return prisma.stock.update({
        where: { id: stockCheckupMedicinesRecords[idx].id },
        data: {
          outQuantity: { increment: diff },
          stock: { decrement: diff }
        }
      });
    });

    const updateDataPastCheckupMedicines = pastCheckupMedicines
      .filter(pastMedicine => !checkupMedicines.some(m => m.medicineId === pastMedicine.medicineId))
      .map((medicine, idx) => 
        prisma.stock.update({
          where: { id: stockPastCheckupMedicinesRecords[idx].id },
          data: {
            outQuantity: { decrement: medicine.quantity },
            stock: { increment: medicine.quantity }
          }
        })
      );

    await Promise.all([...updateDataCheckupMedicines, ...updateDataPastCheckupMedicines]);

    // 2. Delete old checkup medicines
    await prisma.checkupMedicine.deleteMany({
      where: { checkupId: id }
    });

    // 3. Update the checkup record
    const updatedCheckup = await prisma.checkup.update({
      where: { id },
      data: {
        patientId,
        doctorId,
        staffId: staff.id,
        date: date + "T00:00:00Z",
        diagnosis,
        symptoms,
        temperature: parseFloat(temperature),
        bloodPressure,
        pulseRate: parseInt(pulseRate),
        spO2: parseFloat(spO2),
        referredDoctor,
        referredHospital,
        CheckupMedicine: {
          create: checkupMedicines,
        },
      },
    });

    // 4. Handle observation updates if enabled
    if (isUnderObservation) {
      const existingObservation = await prisma.patientUnderObs.findFirst({
        where: { checkupId: id }
      });

      // Delete existing observation if it exists
      if (existingObservation) {
        await prisma.observationDetails.delete({
          where: { id: existingObservation.observationId }
        });
        await prisma.patientUnderObs.delete({
          where: { id: existingObservation.id }
        });

        // Return stock from previous observation
        const prevObservation = await prisma.observationDetails.findUnique({
          where: { id: existingObservation.observationId }
        });
        
        if (prevObservation) {
          const prevStock = await prisma.stock.findFirst({
            where: { medicineId: prevObservation.medicineId }
          });
          
          if (prevStock) {
            await prisma.stock.update({
              where: { id: prevStock.id },
              data: {
                outQuantity: { decrement: prevObservation.dailyQuantity * prevObservation.days },
                stock: { increment: prevObservation.dailyQuantity * prevObservation.days }
              }
            });
          }
        }
      }

      // Create new observation details
      const createdObsDetails = await prisma.observationDetails.create({
        data: {
          medicineId: observationDetails[0].medicineId,
          dosage: observationDetails[0].dosage,
          frequency: observationDetails[0].frequency,
          dailyQuantity: observationDetails[0].dailyQuantity,
          days: observationDetails[0].days,
          availableQuantity: observationDetails[0].availableQty,
        }
      });

      // Create new PatientUnderObs record
      await prisma.patientUnderObs.create({
        data: {
          checkupId: id,
          observationId: createdObsDetails.id,
          isUnderObservation: true,
        }
      });

      // Update stock for observation medicines using the found stock record
      if (observationStockRecord) {
        await prisma.stock.update({
          where: { id: observationStockRecord.id },
          data: {
            outQuantity: { increment: observationDetails[0].dailyQuantity * observationDetails[0].days },
            stock: { decrement: observationDetails[0].dailyQuantity * observationDetails[0].days },
          }
        });
      }
    } else {
      // Remove observation if it exists but is being disabled
      const existingObservation = await prisma.patientUnderObs.findFirst({
        where: { checkupId: id }
      });
      if (existingObservation) {
        // Return stock from observation
        const prevObservation = await prisma.observationDetails.findUnique({
          where: { id: existingObservation.observationId }
        });
        
        if (prevObservation) {
          const prevStock = await prisma.stock.findFirst({
            where: { medicineId: prevObservation.medicineId }
          });
          
          if (prevStock) {
            await prisma.stock.update({
              where: { id: prevStock.id },
              data: {
                outQuantity: { decrement: prevObservation.dailyQuantity * prevObservation.days },
                stock: { increment: prevObservation.dailyQuantity * prevObservation.days }
              }
            });
          }
        }

        await prisma.observationDetails.delete({
          where: { id: existingObservation.observationId }
        });
        await prisma.patientUnderObs.delete({
          where: { id: existingObservation.id }
        });
      }
    }

    return updatedCheckup;
  });

  return res.status(200).json({
    ok: true,
    data: result,
    message: "Prescription updated successfully",
  });
};
// @desc    Delete Checkup Record
// route    DELETE /api/checkup
// @access  Private (Admin)
const deleteCheckup = async (req, res, next) => {
  const { id } = req.params;

  // 1. Validate checkup exists
  const checkupRecord = await prisma.checkup.findUnique({
    where: { id },
    include: {
      PatientUnderObs: {
        include: {
          observation: true
        }
      }
    }
  });

  if (!checkupRecord) {
    throw new ExpressError("Prescription Record doesn't exist", 404);
  }

  // 2. Get all checkup medicines
  const checkupMedicines = await prisma.checkupMedicine.findMany({
    where: { checkupId: id }
  });

  // 3. Validate medicine stock updates
  let stockRecords = [];
  for (const [idx, medicine] of checkupMedicines.entries()) {
    const stockRecord = await prisma.stock.findFirst({
      where: { medicineId: medicine.medicineId }
    });
    
    if (!stockRecord) {
      throw new ExpressError(
        `Stock record not found for medicine with ID ${medicine.medicineId} in ITEM ${idx + 1}`,
        404
      );
    }
    
    if (stockRecord.outQuantity - medicine.quantity < 0) {
      throw new ExpressError(
        `Cannot update stock for medicine item ${idx + 1} on deletion`,
        401
      );
    }
    
    stockRecords.push(stockRecord);
  }

  // 4. Process everything in a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // A. Update stock for checkup medicines
    await Promise.all(
      checkupMedicines.map((medicine, idx) =>
        prisma.stock.update({
          where: { id: stockRecords[idx].id },
          data: {
            outQuantity: { decrement: medicine.quantity },
            stock: { increment: medicine.quantity }
          }
        })
      )
    );

    // B. Delete observation if exists
    if (checkupRecord.PatientUnderObs) {
      // First return stock from observation
      if (checkupRecord.PatientUnderObs.observation) {
        const obsStockRecord = await prisma.stock.findFirst({
          where: { medicineId: checkupRecord.PatientUnderObs.observation.medicineId }
        });
        
        if (obsStockRecord) {
          await prisma.stock.update({
            where: { id: obsStockRecord.id },
            data: {
              outQuantity: { 
                decrement: checkupRecord.PatientUnderObs.observation.dailyQuantity * 
                checkupRecord.PatientUnderObs.observation.days 
              },
              stock: { 
                increment: checkupRecord.PatientUnderObs.observation.dailyQuantity * 
                checkupRecord.PatientUnderObs.observation.days 
              }
            }
          });
        }
      }

      // Delete observation details first
      await prisma.observationDetails.delete({
        where: { id: checkupRecord.PatientUnderObs.observationId }
      });
      
      // Then delete the PatientUnderObs record
      await prisma.patientUnderObs.delete({
        where: { id: checkupRecord.PatientUnderObs.id }
      });
    }

    // C. Delete checkup medicines
    await prisma.checkupMedicine.deleteMany({
      where: { checkupId: id }
    });

    // D. Delete the checkup itself
    return await prisma.checkup.delete({
      where: { id }
    });
  });

  return res.status(200).json({
    ok: true,
    data: result,
    message: "Prescription Record deleted successfully",
  });
};

module.exports = {
  getCheckupDetails,
  getCheckupList,
  getMedicalHistory,
  createCheckup,
  updateCheckup,
  deleteCheckup,
};
