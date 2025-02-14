const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/medical";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectDB;
