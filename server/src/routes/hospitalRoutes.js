const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const authMiddleware = require("../middlewares/authMiddleware");
const profileMiddleware = require("../middlewares/profileMiddleware");

const roleMap = require("../utils/roleMap");

const {getHospitalList ,addHospital,updateHospital,deleteHospital,getHospitalById}= require('../controllers/hospitalController.js');

router.use(authMiddleware([], false), profileMiddleware(true));

router.get("/", authMiddleware(roleMap("GET_HOSPITAL_LIST")), catchAsync(getHospitalList));
router.post("/", authMiddleware(roleMap("ADD_HOSPITAL")), catchAsync(addHospital));
router.put("/:id", authMiddleware(roleMap("UPDATE_HOSPITAL")), catchAsync(updateHospital));
router.delete("/:id", authMiddleware(roleMap("DELETE_HOSPITAL")), catchAsync(deleteHospital));
router.get("/:id", authMiddleware(roleMap( "UPDATE_HOSPITAL")), catchAsync(getHospitalById));

module.exports = router;
