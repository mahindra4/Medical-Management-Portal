// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

const models = require('../models')
const connectDB = require('../db')

connectDB() // connects to the database

const sendMail = require("../utils/sendMail.js");
const generateOtp = require("../utils/generateOtp.js");
const ExpressError = require("../utils/ExpressError.js");
const { OTP_MAIL_TEMPLATE } = require("../../constants.js");

const sendOtp = async (req, res, next) => {
  const { email, action } = req.body;
  // const userRequested = await prisma.requests.findUnique({
  //   where: {
  //     email: email,
  //   },
  // });
  console.log('email: '+email)
  const userRequested = await models.Requests.findOne({ email: email});
  // console.log('userRequested: '+userRequested)
  if (action === "SIGNUP" && userRequested) {
    throw new ExpressError(
      "User already requested, Please wait for approval",
      409
    );
  }

  // const userExists = await prisma.user.findUnique({
  //   where: {
  //     email: email,
  //   },
  // });

  const userExists = await models.User.findOne({ email });

  if (action === "SIGNUP" && userExists && userExists.status === "ACTIVE") {
    throw new ExpressError("User already exists, Please Login", 409);
  }

  if (action === "LOGIN") {
    if (!userExists || userExists.status === "INACTIVE")
      throw new ExpressError("User does not exists, Please Signup", 404);
  }

  const { otp, expiry } = generateOtp();
  console.log(otp);
  //setting up otp details in the verification model
  // const otpDetail = await prisma.verification.upsert({
  //   where: {
  //     email,
  //   },
  //   update: {
  //     otp: otp,
  //     expiryTime: expiry,
  //   },
  //   create: {
  //     email: email,
  //     otp: otp,
  //     expiryTime: expiry,
  //   },
  // });

  const otpDetail = await models.Verification.findOneAndUpdate(
    { email },
    { otp, expiryTime: expiry },
    { upsert: true, new: true }
  );
  
  const otpInfo = await models.Verification.findOne({ email });
  // console.log('doraemon otp: ',otpInfo)
  if (!otpDetail) {
    throw new ExpressError("Error in sending OTP, Please try again later", 500);
  }

  const mailTemplate = OTP_MAIL_TEMPLATE(otp);
  const mailOptions = {
    from: "dep2024.p06@gmail.com",
    to: email,
    subject: action == "SIGNUP" ? "Mediease - Signup" : "Mediease - Login",
    html: mailTemplate,
    text: "",
  };

  const info = await sendMail(mailOptions);
  if (info) {
    return res.status(200).json({
      ok: true,
      message: "OTP sent successfully",
      data: {
        email: email,
      },
    });
  } else {
    throw new ExpressError("OTP sending failed", 500);
  }
};

const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  // const otpInfo = await prisma.verification.findUnique({
  //   where: {
  //     email,
  //   },
  // });
  console.log('verfify otp');
  console.log(req.body)
  const otpInfo = await models.Verification.findOne({ email });
  
  console.log("otpInfo : ", otpInfo);

  if (!otpInfo) {
    throw new ExpressError("No OTP found. Please try again later", 404);
  }

  const now = new Date();
  if (otpInfo.expiryTime < now) {
    throw new ExpressError("OTP expired, Please try again", 400);
  }

  if (otpInfo.otp !== otp) {
    throw new ExpressError("OTP invalid.", 401);
  }

  //deleting the verification record for the user email
  // const deletedPrisma = await prisma.verification.delete({
  //   where: {
  //     email,
  //   },
  // });

  const deletedRecord = await models.Verification.findOneAndDelete({ email });
  console.log("OTP verified successfully")
  return res.status(200).json({
    ok: true,
    message: "OTP verified successfully",
    data: {
      email,
    },
  });
};

module.exports = { sendOtp, verifyOtp };
