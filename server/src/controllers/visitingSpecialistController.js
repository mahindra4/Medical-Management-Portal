const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ExpressError = require("../utils/ExpressError");

// @desc    Get Visiting Specialist List
// route    GET /api/visiting-specialist
// @access  Private (Admin)
const getVisitingSpecialistList = async (req, res, next) => {
  try {
    let specialistList = await prisma.VisitingSpecialist.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.status(200).json({
      ok: true,
      data: specialistList,
      message: "Visiting Specialist List retrieved successfully",
    });
  } catch (err) {
    console.log(`Visiting Specialist Fetching Error: ${err.message}`);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Fetching Visiting Specialist failed, Please try again later",
    });
  }
};

// @desc    Get Single Visiting Specialist
// route    GET /api/visiting-specialist/:id
// @access  Private (Admin)
const getVisitingSpecialist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const specialist = await prisma.VisitingSpecialist.findUnique({
      where: {
        id: id,
      },
    });

    if (!specialist) {
      return res.status(404).json({
        ok: false,
        data: null,
        message: "Visiting Specialist not found",
      });
    }

    return res.status(200).json({
      ok: true,
      data: specialist,
      message: "Visiting Specialist retrieved successfully",
    });
  } catch (err) {
    console.log(`Visiting Specialist Fetching Error: ${err.message}`);

    return res.status(500).json({
      ok: false,
      data: null,
      message: "Fetching Visiting Specialist failed, Please try again later",
    });
  }
};

// @desc    Create Visiting Specialist
// route    POST /api/visiting-specialist
// @access  Private (Admin)
const createVisitingSpecialist = async (req, res, next) => {
  try {
    const { name, specialization, availableTime, availableDays, contactNumber, email } = req.body;

    const newSpecialist = await prisma.VisitingSpecialist.create({
      data: {
        name,
        specialization,
        availableTime,
        availableDays,
        contactNumber,
        email,
        status: "ACTIVE",
      },
    });

    return res.status(201).json({
      ok: true,
      data: newSpecialist,
      message: "Visiting Specialist added successfully",
    });
  } catch (err) {
    console.log(`Visiting Specialist Creation Error: ${err.message}`);
    return res.status(500).json({
      ok: false,
      data: null,
      message: "Creating Visiting Specialist failed, Please try again later",
    });
  }
};

// @desc    Update Visiting Specialist
// route    PUT /api/visiting-specialist/:id
// @access  Private (Admin)
const updateVisitingSpecialist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, specialization, availableTime, availableDays, contactNumber, email } = req.body;

    const updatedSpecialist = await prisma.VisitingSpecialist.update({
      where: {
        id,
      },
      data: {
        name,
        specialization,
        availableTime,
        availableDays,
        contactNumber,
        email,
      },
    });

    return res.status(200).json({
      ok: true,
      data: updatedSpecialist,
      message: "Visiting Specialist updated successfully",
    });
  } catch (err) {
    console.log(`Visiting Specialist Updating Error: ${err.message}`);

    let errMsg = "Updating Visiting Specialist failed, Please try again later";
    let errCode = 500;

    if (err.code === "P2025") {
      errMsg = "Visiting Specialist does not exist";
      errCode = 404;
    }

    return res.status(errCode).json({
      ok: false,
      data: null,
      message: errMsg,
    });
  }
};

// @desc    Delete Visiting Specialist
// route    DELETE /api/visiting-specialist/:id
// @access  Private (Admin)
const deleteVisitingSpecialist = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const specialist = await prisma.VisitingSpecialist.findUnique({
      where: {
        id,
      },
    });

    if (!specialist) {
      return res.status(404).json({
        ok: false,
        data: null,
        message: "Visiting Specialist not found",
      });
    }

    const deletedSpecialist = await prisma.VisitingSpecialist.update({
      where: {
        id,
      },
      data: {
        status: "INACTIVE",
      },
    });

    return res.status(200).json({
      ok: true,
      data: deletedSpecialist,
      message: "Visiting Specialist deleted successfully",
    });
  } catch (err) {
    console.log(`Visiting Specialist Deletion Error: ${err.message}`);

    let errMsg = "Deleting Visiting Specialist failed, Please try again later";
    let errCode = 500;

    if (err.code === "P2025") {
      errMsg = "Visiting Specialist does not exist";
      errCode = 404;
    }

    return res.status(errCode).json({
      ok: false,
      data: null,
      message: errMsg,
    });
  }
};

// @desc    Get today's Visiting Specialists
// route    GET /api/visiting-specialist/today
// @access  Private
const getTodayVisitingSpecialists = async (req, res, next) => {
  try {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    let specialistList = await prisma.VisitingSpecialist.findMany({
      where: {
        status: "ACTIVE",
        availableDays: {
          contains: today,
        },
      },
    });
    
    return res.status(200).json({
      ok: true,
      data: specialistList,
      message: "Today's Visiting Specialists retrieved successfully",
    });
  } catch (err) {
    console.log(`Today's Visiting Specialists Fetching Error: ${err.message}`);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Fetching Today's Visiting Specialists failed, Please try again later",
    });
  }
};

module.exports = {
  getVisitingSpecialistList,
  getVisitingSpecialist,
  createVisitingSpecialist,
  updateVisitingSpecialist,
  deleteVisitingSpecialist,
  getTodayVisitingSpecialists,
};