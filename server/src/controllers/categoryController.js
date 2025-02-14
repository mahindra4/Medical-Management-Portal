const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError");
const models = require('../models')
const connectDB = require('../db')

connectDB() // connects to the database
const Category = models.Category;

// @desc    Get Category List
// route    GET /api/medicine/category/list
// @access  Private (Admin)
const getCategoryList = async (req, res, next) => {
  try {
    const categoryList = await Category.find({ status: "ACTIVE" });
    return res.status(200).json({
      ok: true,
      data: categoryList,
      message: "Category List retrieved successfully",
    });
  } catch (err) {
    console.log(`Category List Fetching Error : ${err.message}`);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Fetching Category List failed, Please try again later",
    });
  }
};

// @desc    Get Single Category
// route    GET /api/medicine/category/:id
// @access  Private (Admin)
const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    return res.status(200).json({
      ok: true,
      data: category,
      message: "Category retrieved successfully",
    });
  } catch (err) {
    console.log(`Category Fetching Error : ${err.message}`);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Fetching Category failed, Please try again later",
    });
  }
};

// @desc    Create Category Records
// route    POST /api/medicine/category/create
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  console.log(req.body);
  const { categoryName, strengthType } = req.body;
  const categoryExists = await Category.findOne({
    categoryName: categoryName.trim().toUpperCase(),
  });

  let newCategory;
  if (categoryExists && categoryExists.status === "ACTIVE") {
    throw new ExpressError("Category already exists", 400);
  }
  if (categoryExists && categoryExists.status === "INACTIVE") {
    categoryExists.categoryName = categoryName.trim().toUpperCase();
    categoryExists.strengthType = strengthType;
    categoryExists.status = "ACTIVE";
    newCategory = await categoryExists.save();
  }

  if (!categoryExists) {
    newCategory = await Category.create({
      categoryName: categoryName.trim().toUpperCase(),
      strengthType,
    });
  }
  return res.status(200).json({
    ok: true,
    data: newCategory,
    message: "Category record created successfully",
  });
};

// @desc    Update Category List Record
// route    PUT /api/medicine/category/:id
// @access  Private (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRecord = await Category.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({
      ok: true,
      data: updatedRecord,
      message: "Category List record updated successfully",
    });
  } catch (err) {
    console.log(`Category List Updating Error : ${err.message}`);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Updating category list record failed, Please try again later",
    });
  }
};

// @desc    Delete Category List Record
// route    DELETE /api/medicine/category/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRecord = await Category.findByIdAndUpdate(id, { status: "INACTIVE" }, { new: true });
    return res.status(200).json({
      ok: true,
      data: deletedRecord,
      message: "Category List Record deleted successfully",
    });
  } catch (err) {
    console.log(`Category List Deletion Error : ${err.message}`);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Deleting category list record failed, Please try again later",
    });
  }
};

module.exports = {
  getCategory,
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
};
