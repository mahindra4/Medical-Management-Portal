
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  
  email: {  type: String, 
            unique: true, 
            required: true },
  
  name: { type: String, required: true },
  
  role: { type: String, 
          enum: ['DOCTOR', 'PATIENT', 'ADMIN', 'PARAMEDICAL'],
          required: true },
  status: { type: String,
            enum: ['ACTIVE', 'INACTIVE'], 
            default: 'ACTIVE' }

}, { collection: 'user' });

const RequestsSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  email: { type: String, unique: true, required: true },

  name: { type: String, required: true },

  role: { type: String, enum: ['DOCTOR', 'PATIENT', 'ADMIN', 'PARAMEDICAL'], required: true }
},
 { collection: 'requests' });

const VerificationSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  
  email: { type: String, unique: true, required: true },
  
  otp: { type: String, required: true },
  
  expiryTime: { type: Date, required: true }
});

const MedicineSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
 
  brandName: { type: String, required: true },
  
  saltName: { type: String, required: true },
    
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { collection: 'medicine' });

const SupplierSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  
  name: { type: String, required: true },
  address: { type: String, required: true },
  
  city: { type: String },
  state: { type: String, required: true },
  //
  pinCode: { type: Number },
  
  mobileNumber: { type: String, unique: true, required: true },
  
  email: { type: String },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { collection: 'supplier' });

const PatientSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  
  department: { type: String, 
                enum: ['COMPUTER_SCIENCE', 'ELECTRICAL', 'MECHANICAL', 'MATHEMATICS_COMPUTING', 'CHEMICAL', 'CIVIL', 'METALLURGY', 'ENGINEERING_PHYSICS', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'MATHEMATICS', 'HUMANITIES'] },
  
                age: { type: Number, required: true },
  
                email: { type: String, unique: true, required: true },
  bloodGroup: { type: String, required: true },
  
  program: { type: String, enum: ['BTECH', 'MTECH', 'PHD', 'DUAL_DEGREE'] },
  
  fatherOrSpouseName: { type: String },
  
  category: { type: String, enum: ['STUDENT', 'FACULTY', 'STAFF', 'VISITOR'], required: true },
  gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
  allergy: { type: String },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { collection: 'patient' });

const CheckupSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  
  temperature: { type: Number },
  
  date: { type: Date, required: true },
  
  spO2: { type: Number },
  pulseRate: { type: Number },
  bloodPressure: { type: String },
  
  symptoms: { type: String },
  
  diagnosis: { type: String, required: true },
  referredDoctor: { type: String },
  referredHospital: { type: String },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true }
}, { collection: 'checkup' });

module.exports = {
  User: mongoose.model('User', UserSchema),
  Requests: mongoose.model('Requests', RequestsSchema),
  Verification: mongoose.model('Verification', VerificationSchema),
  Medicine: mongoose.model('Medicine', MedicineSchema),
  Supplier: mongoose.model('Supplier', SupplierSchema),
  Patient: mongoose.model('Patient', PatientSchema),
  Checkup: mongoose.model('Checkup', CheckupSchema)
};