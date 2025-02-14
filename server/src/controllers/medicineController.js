const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError.js");

const models = require('../models')
const connectDB = require('../db')

connectDB() // connects to the database

const Medicine = models.Medicine
const Category = models.Category;
const Purchase = models.Purchase;

// @desc    Get Medicine List
// route    GET /api/medicine
// @access  Private (Admin)
const getMedicineList = async (req, res, next) => {
  const medicineList = await Medicine.find({ status: "ACTIVE" }).populate("categoryId");

  const responseData = medicineList.map((medicine) => ({
    id: medicine._id,
    brandName: medicine.brandName,
    saltName: medicine.saltName,
    categoryName: medicine.categoryId.categoryName,
  }));

  return res.status(200).json({
    ok: true,
    data: responseData,
    message: "Medicine List retrieved successfully",
  });
};

// @desc    Get a single medicine
// route    GET /api/medicine/:id
// @access  Private (Admin)
const getMedicine = async (req, res, next) => {
  const { id } = req.params;
  const medicine = await Medicine.findById(id).populate("categoryId");

  return res.status(200).json({
    ok: true,
    data: medicine,
    message: "Medicine retrieved successfully",
  });
};

//get all the expired medicines
const getExpiredMedicines = async (req, res, next) => {
  const expiredMedicines = await Purchase.find({ expiryDate: { $lte: new Date() } }).populate("medicineId");

  const responseData = expiredMedicines.map((medicine) => ({
    batchNo: medicine.batchNo,
    brandName: medicine.medicineId.brandName,
    saltName: medicine.medicineId.saltName,
    expiryDate: medicine.expiryDate.toISOString().split("T")[0],
    quantity: medicine.quantity,
  }));

  return res.status(200).json({
    ok: true,
    data: responseData,
    message: "Expired Medicines List fetched successfully",
  });
};

// @desc    Create Medicine List Records
// route    POST /api/medicine
// @access  Private (Admin)
const createMedicineList = async (req, res, next) => {
  const { saltName, brandName, categoryId } = req.body;
  const category = await Category.findOne({ _id: categoryId, status: "ACTIVE" });

  if (!category) {
    throw new ExpressError("Category does not exist", 404);
  }

  const medicineExists = await Medicine.findOne({ brandName });

  let newMedicineRecord;
  if (medicineExists && medicineExists.status === "ACTIVE") {
    throw new ExpressError("Medicine already exists", 400);
  }
  if (medicineExists && medicineExists.status === "INACTIVE") {
    medicineExists.saltName = saltName;
    medicineExists.brandName = brandName;
    medicineExists.categoryId = categoryId;
    medicineExists.status = "ACTIVE";
    newMedicineRecord = await medicineExists.save();
  }

  if (!medicineExists) {
    newMedicineRecord = await Medicine.create({ saltName, brandName, categoryId });
  }

  return res.status(200).json({
    ok: true,
    data: newMedicineRecord,
    message: "Medicine List record created successfully",
  });
};

// @desc    Update Medicine List Record
// route    PUT /api/medicine/:id
// @access  Private (Admin)
const updateMedicineList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRecord = await Medicine.findByIdAndUpdate(id, req.body, { new: true });

    return res.status(200).json({
      ok: true,
      data: updatedRecord,
      message: "Medicine List record updated successfully",
    });
  } catch (err) {
    console.log(`Medicine List Updating Error : ${err.message}`);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Updating medicine list record failed, Please try again later",
    });
  }
};

// @desc    Delete Medicine List Record
// route    DELETE /api/medicine/:id
// @access  Private (Admin)
const deleteMedicineList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRecord = await Medicine.findByIdAndUpdate(id, { status: "INACTIVE" }, { new: true });

    return res.status(200).json({
      ok: true,
      data: deletedRecord,
      message: "Medicine List Record deleted successfully",
    });
  } catch (err) {
    console.log(`Medicine List Deletion Error : ${err.message}`);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Deleting medicine list record failed, Please try again later",
    });
  }
};

module.exports = {
  getMedicineList,
  getMedicine,
  getExpiredMedicines,
  createMedicineList,
  updateMedicineList,
  deleteMedicineList,
};