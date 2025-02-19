const { v4: uuidv4 } = require("uuid");
const ExpressError = require("../utils/ExpressError");
const sendMail = require("../utils/sendMail");
const {
  ACCOUNT_CREATED_MAIL_TEMPLATE,
  ACCOUNT_DELETED_MAIL_TEMPLATE,
} = require("../../constants");
const { User } = require("../mongo_schem");

// @desc    Get Admin List
// route    GET /api/admin
// @access  Private (Admin)
const getAdminList = async (req, res, next) => {
  try {
    const adminList = await User.find({ role: "ADMIN", status: "ACTIVE" });
    return res.status(200).json({
      ok: true,
      data: adminList,
      message: "Admin List retrieved successfully",
    });
  } catch (err) {
    next(new ExpressError("Failed to fetch admin list", 500));
  }
};

// @desc    Create Admin Records
// route    POST /api/admin
// @access  Private (Admin)
const createAdmin = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    let userRecord = await User.findOne({ email });
    
    if (userRecord && userRecord.status === "ACTIVE") {
      throw new ExpressError("User already exists with the given email.", 400);
    }

    let newRecord;
    if (userRecord && userRecord.status === "INACTIVE") {
      userRecord.name = name;
      userRecord.role = "ADMIN";
      userRecord.status = "ACTIVE";
      newRecord = await userRecord.save();
    } else {
      newRecord = await User.create({ name, email, role: "ADMIN" });
    }

    const mailOptions = {
      from: "dep2024.p06@gmail.com",
      to: email,
      subject: "Mediease - Account Created",
      html: ACCOUNT_CREATED_MAIL_TEMPLATE(),
    };
    
    await sendMail(mailOptions);

    return res.status(200).json({
      ok: true,
      data: newRecord,
      message: "Admin added successfully",
    });
  } catch (err) {
    next(new ExpressError("Failed to create admin", 500));
  }
};

// @desc    Update Admin Record
// route    PUT /api/admin/:id
// @access  Private (Admin)
const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRecord = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedRecord) throw new ExpressError("Record does not exist", 404);

    return res.status(200).json({
      ok: true,
      data: updatedRecord,
      message: "Admin record updated successfully",
    });
  } catch (err) {
    next(new ExpressError("Failed to update admin record", 500));
  }
};

// @desc    Delete Admin Record
// route    DELETE /api/admin/:id
// @access  Private (Admin)
const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminRecord = await User.findById(id);
    if (!adminRecord) throw new ExpressError("Admin does not exist", 404);

    adminRecord.status = "INACTIVE";
    await adminRecord.save();

    const mailOptions = {
      from: "dep2024.p06@gmail.com",
      to: adminRecord.email,
      subject: "Mediease - Account Deleted",
      html: ACCOUNT_DELETED_MAIL_TEMPLATE(),
    };
    await sendMail(mailOptions);

    return res.status(200).json({
      ok: true,
      data: adminRecord,
      message: "Admin record deleted successfully",
    });
  } catch (err) {
    next(new ExpressError("Failed to delete admin record", 500));
  }
};

module.exports = {
  getAdminList,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
