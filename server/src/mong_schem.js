const mongoose = require('mongoose');
const { Schema } = mongoose;
const uuid = require('uuid');

// User Schema
const userSchema = new Schema({
  id: { type: String, default: () => uuid.v4() }, 
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['DOCTOR', 'PATIENT', 'ADMIN', 'PARAMEDICAL'],
    required: true 
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

// Requests Schema
const requestsSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['DOCTOR', 'PATIENT', 'ADMIN', 'PARAMEDICAL'],
    required: true 
  }
}, { timestamps: true });

// Verification Schema
const verificationSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  email: { type: String, unique: true, required: true },
  otp: { type: String, required: true },
  expiryTime: { type: Date, required: true }
}, { timestamps: true });

// Category Schema
const categorySchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  categoryName: { type: String, required: true },
  strengthType: { type: String, required: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  Medicine: [{ type: Schema.Types.ObjectId, ref: 'Medicine' }]
}, { timestamps: true });

// Medicine Schema
const medicineSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  brandName: { type: String, required: true },
  saltName: { type: String, required: true },
  categoryId: { type: String, required: true },
  Stock: [{ type: Schema.Types.ObjectId, ref: 'Stock' }],
  Purchases: [{ type: Schema.Types.ObjectId, ref: 'Purchase' }],
  CheckupMedicine: [{ type: Schema.Types.ObjectId, ref: 'CheckupMedicine' }],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  Category: { type: Schema.Types.ObjectId, ref: 'Category' }
}, { timestamps: true });

// Stock Schema
const stockSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  medicineId: { type: String, required: true },
  stock: { type: Number, required: true },
  inQuantity: { type: Number },
  outQuantity: { type: Number },
  Medicine: { type: Schema.Types.ObjectId, ref: 'Medicine' }
}, { timestamps: true });

// Supplier Schema
const supplierSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String },
  state: { type: String, required: true },
  pinCode: { type: Number },
  mobileNumber: { type: String, unique: true, required: true },
  email: { type: String },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  PurchaseList: [{ type: Schema.Types.ObjectId, ref: 'PurchaseList' }]
}, { timestamps: true });

// Staff Schema
const staffSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  mobileNumber: { type: String },
  role: { type: String, enum: ['DOCTOR', 'PARAMEDICAL'], required: true },
  department: { type: String },
  speciality: { type: String },
  gender: { type: String, enum: ['MALE', 'FEMALE'] },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  DoctorCheckups: [{ type: Schema.Types.ObjectId, ref: 'Checkup' }],
  StaffCheckups: [{ type: Schema.Types.ObjectId, ref: 'Checkup' }],
  Schedule: [{ type: Schema.Types.ObjectId, ref: 'Schedule' }]
}, { timestamps: true });

// Schedule Schema
const scheduleSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  staffId: { type: String, required: true },
  shift: { type: String, enum: ['MORNING', 'AFTERNOON', 'NIGHT'] },
  day: { type: String, enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] },
  Staff: { type: Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

// Purchase Schema
const purchaseSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  purchaseListId: { type: String, required: true },
  medicineId: { type: String, required: true },
  mfgDate: { type: Date },
  expiryDate: { type: Date, required: true },
  batchNo: { type: Number, unique: true },
  quantity: { type: Number, required: true },
  Medicine: { type: Schema.Types.ObjectId, ref: 'Medicine' },
  PurchaseList: { type: Schema.Types.ObjectId, ref: 'PurchaseList' }
}, { timestamps: true });

// Purchase List Schema
const purchaseListSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  supplierId: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  invoiceNo: { type: Number, unique: true },
  Details: { type: String },
  Supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  Purchase: [{ type: Schema.Types.ObjectId, ref: 'Purchase' }]
}, { timestamps: true });

// Checkup Schema
const checkupSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  patientId: { type: String, required: true },
  temperature: { type: Number },
  date: { type: Date, required: true },
  spO2: { type: Number },
  pulseRate: { type: Number },
  bloodPressure: { type: String },
  symptoms: { type: String },
  diagnosis: { type: String, required: true },
  referredDoctor: { type: String },
  referredHospital: { type: String },
  doctorId: { type: String },
  staffId: { type: String },
  Patient: { type: Schema.Types.ObjectId, ref: 'Patient' },
  Doctor: { type: Schema.Types.ObjectId, ref: 'Staff' },
  Staff: { type: Schema.Types.ObjectId, ref: 'Staff' },
  CheckupMedicine: [{ type: Schema.Types.ObjectId, ref: 'CheckupMedicine' }]
}, { timestamps: true });

// Checkup Medicine Schema
const checkupMedicineSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  medicineId: { type: String, required: true },
  dosage: { type: String },
  quantity: { type: Number },
  checkupId: { type: String },
  Medicine: { type: Schema.Types.ObjectId, ref: 'Medicine' },
  Checkup: { type: Schema.Types.ObjectId, ref: 'Checkup' }
}, { timestamps: true });

// Patient Schema
const patientSchema = new Schema({
  id: { type: String, default: () => uuid.v4() },
  name: { type: String, required: true },
  department: { type: String },
  age: { type: Number, required: true },
  email: { type: String, unique: true, required: true },
  bloodGroup: { type: String, required: true },
  program: { type: String, enum: ['BTECH', 'MTECH', 'PHD', 'DUAL_DEGREE'] },
  fatherOrSpouseName: { type: String },
  category: { type: String, enum: ['STUDENT', 'FACULTY', 'STAFF', 'VISITOR'], required: true },
  gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
  allergy: { type: String },
  Checkup: [{ type: Schema.Types.ObjectId, ref: 'Checkup' }],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Request = mongoose.model('Request', requestsSchema);
const Verification = mongoose.model('Verification', verificationSchema);
const Category = mongoose.model('Category', categorySchema);
const Medicine = mongoose.model('Medicine', medicineSchema);
const Stock = mongoose.model('Stock', stockSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);
const Staff = mongoose.model('Staff', staffSchema);
const Schedule = mongoose.model('Schedule', scheduleSchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);
const PurchaseList = mongoose.model('PurchaseList', purchaseListSchema);
const Checkup = mongoose.model('Checkup', checkupSchema);
const CheckupMedicine = mongoose.model('CheckupMedicine', checkupMedicineSchema);
const Patient = mongoose.model('Patient', patientSchema);

module.exports = {
  User,
  Request,
  Verification,
  Category,
  Medicine,
  Stock,
  Supplier,
  Staff,
  Schedule,
  Purchase,
  PurchaseList,
  Checkup,
  CheckupMedicine,
  Patient
};
