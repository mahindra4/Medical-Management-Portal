const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
//const { validateProcedure } = require('../middlewares');
const authMiddleware = require("../middlewares/authMiddleware");
const profileMiddleware = require("../middlewares/profileMiddleware");
const roleMap = require("../utils/roleMap.js");

const { 
    getAllProcedures,
    getProcedureById,
    createProcedure,
    updateProcedure,
    deleteProcedure } = require('../controllers/procedureController');

router.use(authMiddleware([], false), profileMiddleware(true));
//procedure routes      
router.get("/", authMiddleware(roleMap("GET_PROCEDURE_LIST")), catchAsync(getAllProcedures));
router.get("/:id", authMiddleware(roleMap("GET_PROCEDURE")), catchAsync(getProcedureById));
router.post("/", authMiddleware(roleMap("CREATE_PROCEDURE")), catchAsync(createProcedure));
router.put("/:id", authMiddleware(roleMap("UPDATE_PROCEDURE")), catchAsync(updateProcedure));
router.delete("/:id", authMiddleware(roleMap("DELETE_PROCEDURE")),catchAsync(deleteProcedure));


module.exports = router;
