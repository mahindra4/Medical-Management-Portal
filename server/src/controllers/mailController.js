const mongoose = require("mongoose");
const sendMail = require("../utils/sendMail.js");
const ExpressError = require("../utils/ExpressError.js");
const {
  PENDING_MAIL_TEMPLATE_ADMIN,
  PENDING_MAIL_TEMPLATE_USER,
  APPROVED_MAIL_TEMPLATE,
  REJECTED_MAIL_TEMPLATE,
  FEEDBACK_SUBMIT_TEMPLATE,
} = require("../../constants.js");
const models = require('../models')
const connectDB = require('../db')

connectDB() // connects to the database

const Request = models.Requests;
const User = models.User;

const approveRequestController = async (req, res, next) => {
  const { id } = req.body;
  const request = await Request.findById(id);
  if (!request) {
    throw new ExpressError("Request not found", 404);
  }

  let userExists = await User.findOne({ email: request.email });

  if (userExists && userExists.status === "INACTIVE") {
    userExists.name = request.name;
    userExists.email = request.email;
    userExists.role = request.role;
    userExists.status = "ACTIVE";
    await userExists.save();
  } else if (!userExists) {
    userExists = new User({
      name: request.name,
      email: request.email,
      role: request.role,
    });
    await userExists.save();
  }

  await Request.findByIdAndDelete(id);

  const mailTemplate = APPROVED_MAIL_TEMPLATE(request.role);
  const mailOptions = {
    from: "dep2024.p06@gmail.com",
    to: request.email,
    subject: "Mediease - Request Approved",
    html: mailTemplate,
  };

  const info = await sendMail(mailOptions);
  if (!info) {
    throw new ExpressError("Error in sending approval mail to user", 500);
  }

  return res.status(200).json({ ok: true, data: [], message: "Request approved successfully" });
};

const rejectRequestController = async (req, res, next) => {
  const { id } = req.body;
  const request = await Request.findById(id);
  if (!request) {
    throw new ExpressError("Request not found", 404);
  }

  await Request.findByIdAndDelete(id);

  const mailTemplate = REJECTED_MAIL_TEMPLATE(request.role);
  const mailOptions = {
    from: "dep2024.p06@gmail.com",
    to: request.email,
    subject: "Mediease - Request Declined",
    html: mailTemplate,
  };

  const info = await sendMail(mailOptions);
  if (!info) {
    throw new ExpressError("Error in sending rejection mail to user", 500);
  }

  return res.status(200).json({ ok: true, data: [], message: "Request rejected successfully" });
};

const pendingRequestController = async (req, res, next) => {
  const { name, email, role } = req.body;
  const request = new Request({ name, email, role });
  await request.save();

  const admins = await User.find({ role: "ADMIN" });
  const mailTemplateUser = PENDING_MAIL_TEMPLATE_USER();
  const mailTemplateAdmin = PENDING_MAIL_TEMPLATE_ADMIN(request.email, request.name, request.role);

  for (const admin of admins) {
    const mailOptionsAdmin = {
      from: "dep2024.p06@gmail.com",
      to: admin.email,
      subject: "Mediease - Pending Request Approval",
      html: mailTemplateAdmin,
    };
    await sendMail(mailOptionsAdmin);
  }

  const mailOptionsUser = {
    from: "dep2024.p06@gmail.com",
    to: request.email,
    subject: "Mediease - Role Approval Pending",
    html: mailTemplateUser,
  };

  await sendMail(mailOptionsUser);

  return res.status(200).json({ ok: true, data: [], message: "Approval Pending mail sent to user successfully." });
};

const feedbackSubmitController = async (req, res, next) => {
  const { name, email, role } = req.user;
  const { subject, message } = req.body;
  const admins = await User.find({ role: "ADMIN" });
  const mailTemplateAdmin = FEEDBACK_SUBMIT_TEMPLATE(name, email, role, subject, message);

  for (const admin of admins) {
    const mailOptionsAdmin = {
      from: "dep2024.p06@gmail.com",
      to: admin.email,
      subject: `Feedback: ${subject}`,
      html: mailTemplateAdmin,
    };
    await sendMail(mailOptionsAdmin);
  }

  return res.status(200).json({ ok: true, data: [], message: "Feedback sent successfully." });
};

module.exports = {
  approveRequestController,
  rejectRequestController,
  pendingRequestController,
  feedbackSubmitController,
};
