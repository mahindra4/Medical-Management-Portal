const mongoose = require("mongoose");

// Enums
const StatusEnum = ["ACTIVE", "INACTIVE"];
const UserRoleEnum = ["DOCTOR", "PATIENT", "ADMIN", "PARAMEDICAL"];
const RoleEnum = ["DOCTOR", "PARAMEDICAL"];
const GenderEnum = ["MALE", "FEMALE"];
const ShiftEnum = ["MORNING", "AFTERNOON", "NIGHT"];
const DayEnum = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const PatientCategoryEnum = ["STUDENT", "FACULTY", "STAFF", "VISITOR"];
const ProgramEnum = ["BTECH", "MTECH", "PHD", "DUAL_DEGREE"];

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: String,
  role: { type: String, enum: UserRoleEnum },
  status: { type: String, enum: StatusEnum, default: "ACTIVE" },
});

// Requests Schema
const RequestsSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: String,
  role: { type: String, enum: UserRoleEnum },
});

// Verification Schema
const VerificationSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  otp: String,
  expiryTime: Date,
});

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: String,
  description: String,
  status: { type: String, enum: StatusEnum, default: "ACTIVE" },
});

// Medicine Schema
const MedicineSchema = new mongoose.Schema({
  brandName: String,
  saltName: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  status: { type: String, enum: StatusEnum, default: "ACTIVE" },
});

// Supplier Schema
const SupplierSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String,
  state: String,
  pinCode: Number,
  mobileNumber: { type: String, unique: true },
  email: String,
  status: { type: String, enum: StatusEnum, default: "ACTIVE" },
});

// Staff Schema
const StaffSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobileNumber: String,
  role: { type: String, enum: RoleEnum },
  department: String,
  speciality: String,
  gender: { type: String, enum: GenderEnum },
  status: { type: String, enum: StatusEnum, default: "ACTIVE" },
});

// Schedule Schema
const ScheduleSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  shift: { type: String, enum: ShiftEnum },
  day: { type: String, enum: DayEnum },
});

// Stock Schema
const StockSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  stock: Number,
  inQuantity: Number,
  outQuantity: Number,
});

// Purchase List Schema
const PurchaseListSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  purchaseDate: Date,
  invoiceNo: { type: Number, unique: true },
  details: String,
});

// Purchase Schema
const PurchaseSchema = new mongoose.Schema({
  purchaseListId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseList" },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  mfgDate: Date,
  expiryDate: Date,
  batchNo: { type: Number, unique: true },
  quantity: Number,
});

// Patient Schema
const PatientSchema = new mongoose.Schema({
  name: String,
  department: String,
  age: Number,
  email: { type: String, unique: true },
  bloodGroup: String,
  program: { type: String, enum: ProgramEnum },
  fatherOrSpouseName: String,
  category: { type: String, enum: PatientCategoryEnum },
  gender: { type: String, enum: GenderEnum },
  allergy: String,
  status: { type: String, enum: StatusEnum, default: "ACTIVE" },
});

// Checkup Schema
const CheckupSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  temperature: Number,
  date: Date,
  spO2: Number,
  pulseRate: Number,
  bloodPressure: String,
  symptoms: String,
  diagnosis: String,
  referredDoctor: String,
  referredHospital: String,
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
});

// Checkup Medicine Schema
const CheckupMedicineSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  dosage: String,
  quantity: Number,
  checkupId: { type: mongoose.Schema.Types.ObjectId, ref: "Checkup" },
});

// Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  date: Date,
  timeSlot: String,
  status: { type: String, enum: ["SCHEDULED", "COMPLETED", "CANCELLED"], default: "SCHEDULED" },
});

// Bills Schema
const BillSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  totalAmount: Number,
  date: Date,
  paymentStatus: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
});

// Prescription Schema
const PrescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  medicines: [{ medicineId: mongoose.Schema.Types.ObjectId, dosage: String, quantity: Number }],
  notes: String,
  date: Date,
});

// Pharmacy Transactions Schema
const PharmacyTransactionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  quantity: Number,
  totalPrice: Number,
  date: Date,
});

// Export models
const User = mongoose.model("User", UserSchema, "User");
const Requests = mongoose.model("Requests", RequestsSchema, "Requests");
const Verification = mongoose.model("Verification", VerificationSchema, "Verification");
const Category = mongoose.model("Category", CategorySchema, "Category");
const Medicine = mongoose.model("Medicine", MedicineSchema, "Medicine");
const Supplier = mongoose.model("Supplier", SupplierSchema, "Supplier");
const Staff = mongoose.model("Staff", StaffSchema, "Staff");
const Schedule = mongoose.model("Schedule", ScheduleSchema, "Schedule");
const Stock = mongoose.model("Stock", StockSchema, "Stock");
const PurchaseList = mongoose.model("PurchaseList", PurchaseListSchema, "PurchaseList");
const Purchase = mongoose.model("Purchase", PurchaseSchema, "Purchase");
const Patient = mongoose.model("Patient", PatientSchema, "Patient");
const Checkup = mongoose.model("Checkup", CheckupSchema, "Checkup");
const CheckupMedicine = mongoose.model("CheckupMedicine", CheckupMedicineSchema, "CheckupMedicine");
const Appointment = mongoose.model("Appointment", AppointmentSchema, "Appointment");
const Bill = mongoose.model("Bill", BillSchema, "Bill");
const Prescription = mongoose.model("Prescription", PrescriptionSchema, "Prescription");
const PharmacyTransaction = mongoose.model("PharmacyTransaction", PharmacyTransactionSchema, "PharmacyTransaction");

module.exports = {
  User,
  Requests,
  Verification,
  Category,
  Medicine,
  Supplier,
  Staff,
  Schedule,
  Stock,
  PurchaseList,
  Purchase,
  Patient,
  Checkup,
  CheckupMedicine,
  Appointment,
  Bill,
  Prescription,
  PharmacyTransaction,
};
