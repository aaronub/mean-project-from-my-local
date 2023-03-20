const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const refType = Schema.Types.ObjectId;

const carSchema = new Schema({
  model: String,
  make: String,
  color: String
});

const AddressSchema = new Schema({
  apt: String,
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
})

// const employmentSchema = new Schema({
//   feedback: { type: String },
//   optReceipt: { type: String },
//   optEAD: { type: String },
//   i20: { type: String },
//   i983: { type: String },
//   title: String,
//   startDate: String,
//   endDate: String,
// });

const contactSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: String,
  phone: { type: String, required: true },
  email: { type: String, required: true },
  relationship: { type: String, required: true },
});

const LicenseSchema = new Schema({
  number: { type: String},
  expireDate: { type: String},
  document: { type: String},
});

const ProfileSchema = new Schema({
  feedback: String,
  documentFeedback: String,
  nextStep : Number,
  step: { type: Number, required: true },
  //0:not start
  //1:non-visa
  //2:visa-in progress
  //3:visa-all done
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: String,
  preferredName: String,
  email:String,
  pic: String,
  driverLicense: LicenseSchema,
  address: { type: AddressSchema, required: true },
  cellPhoneNumber: { type: String, required: true },
  workPhoneNumber: String,
  car: carSchema,
  SSN: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: String,
  reference: contactSchema,
  emergencyContacts: { type: [contactSchema], required: true },
  // employment: employmentSchema,
  house: { type: refType, ref: 'House' },
  optReceipt: { type: String },
  optReceiptStatus:{type: String},
  optEAD: { type: String },
  optEADStatus: { type: String },
  i20: { type: String },
  i20Status: { type: String },
  i983: { type: String },
  i983Status: { type: String },
  title: String,
  startDate: String,
  endDate: String,
});

const Profile = mongoose.model("Profile", ProfileSchema, "Profile");

module.exports = Profile;
