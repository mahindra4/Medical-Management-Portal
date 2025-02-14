const { v4: uuidv4 } = require("uuid");
const ExpressError = require("../utils/ExpressError");
const sendMail = require("../utils/sendMail");
const { ACCOUNT_CREATED_MAIL_TEMPLATE, ACCOUNT_DELETED_MAIL_TEMPLATE } = require("../../constants");
const models = require("../models");

// @desc    Get Admin List
// route    GET /api/admin
// @access  Private (Admin)
const getAdminList = async (req, res, next) => {
  const adminList = await models.User.find({
    role: "ADMIN",
    status: "ACTIVE",
  });
  console.log(adminList);

  return res.status(200).json({
    ok: true,
    data: adminList,
    message: "Admin List retrieved successfully",
  });
};

// @desc    Create Admin Records
// route    POST /api/admin
// @access  Private (Admin)
const createAdmin = async (req, res, next) => {
  console.log(req.body);
  const { name, email } = req.body;

  const userRecord = await models.User.findOne({ email });
  if (userRecord && userRecord.status == "ACTIVE") {
    throw new ExpressError("User already exists with the given email.", 400);
  }

  let newRecord;
  if (userRecord && userRecord.status == "INACTIVE") {
    const restoredUserRecord = await models.User.findOneAndUpdate(
      { email },
      {
        name,
        email,
        role: "ADMIN",
        status: "ACTIVE",
      },
      { new: true }
    );
    newRecord = restoredUserRecord;
  }

  if (!userRecord) {
    const createdRecord = await models.User.create({
      name,
      email,
      role: "ADMIN",
    });
    newRecord = createdRecord;
  }

  const mailTemplate = ACCOUNT_CREATED_MAIL_TEMPLATE();
  const mailOptions = {
    from: "dep2024.p06@gmail.com",
    to: email,
    subject: "Mediease - Account Created",
    html: mailTemplate,
    text: "",
  };

  const info = await sendMail(mailOptions);
  if (!info) {
    throw new ExpressError("Error in sending mail to the admin", 500);
  }

  return res.status(200).json({
    ok: true,
    data: newRecord,
    message: "Admin added successfully",
  });
};

// @desc    Update Admin List Record
// route    PUT /api/admin
// @access  Private (Admin)
const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRecord = await models.User.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return res.status(200).json({
      ok: true,
      data: updatedRecord,
      message: "Admin List record updated successfully",
    });
  } catch (err) {
    console.log(`Admin List Updating Error : ${err.message}`);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Updating admin list record failed, Please try again later",
    });
  }
};

// @desc    Delete Admin List Record
// route    DELETE /api/admin
// @access  Private (Admin)
const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminRecord = await models.User.findById(id);

    if (!adminRecord) {
      throw new ExpressError("Admin does not exist", 404);
    }

    const deletedRecord = await models.User.findByIdAndUpdate(
      id,
      { status: "INACTIVE" },
      { new: true }
    );

    const mailTemplate = ACCOUNT_DELETED_MAIL_TEMPLATE();
    const mailOptions = {
      from: "dep2024.p06@gmail.com",
      to: adminRecord.email,
      subject: "Mediease - Account Deleted",
      html: mailTemplate,
      text: "",
    };

    const info = await sendMail(mailOptions);
    if (!info) {
      throw new ExpressError("Error in sending mail to the admin", 500);
    }
    return res.status(200).json({
      ok: true,
      data: deletedRecord,
      message: "Admin List Record deleted successfully",
    });
  } catch (err) {
    console.log(`Admin List Deletion Error : ${err.message}`);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Deleting admin list record failed, Please try again later",
    });
  }
};

module.exports = {
  getAdminList,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
