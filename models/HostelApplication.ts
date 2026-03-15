import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IHostelApplication extends Document {
  studentId: mongoose.Types.ObjectId;
  fullName: string;
  regNo: string;
  applicationNo: string;
  gender: string;
  dob: Date;
  category: string;
  nationality: string;
  bloodGroup: string;
  aadhaarNo: string;
  
  // Academic Details
  collegeName: string;
  course: string;
  branch: string;
  yearSemester: string;
  academicSession: string;
  admissionMode: string;
  
  // Residential Address
  permanentAddress: string;
  cityVillage: string;
  district: string;
  state: string;
  pinCode: string;
  
  // Parent / Guardian Details
  fatherName: string;
  motherName: string;
  guardianName?: string;
  occupation: string;
  mobileNo: string;
  alternateMobileNo?: string;
  emailId: string;
  
  // Hostel Preference
  hostelType: string;
  roomPreference: string;
  floorPreference?: string;

  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HostelApplicationSchema = new Schema<IHostelApplication>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    fullName: { type: String, required: true },
    regNo: { type: String, required: true },
    applicationNo: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    category: { type: String, required: true },
    nationality: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    aadhaarNo: { type: String, required: true },
    
    // Academic Details
    collegeName: { type: String, required: true },
    course: { type: String, required: true },
    branch: { type: String, required: true },
    yearSemester: { type: String, required: true },
    academicSession: { type: String, required: true },
    admissionMode: { type: String, required: true },

    // Residential Address
    permanentAddress: { type: String, required: true },
    cityVillage: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },

    // Parent / Guardian Details
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    guardianName: { type: String },
    occupation: { type: String, required: true },
    mobileNo: { type: String, required: true },
    alternateMobileNo: { type: String },
    emailId: { type: String, required: true },

    // Hostel Preference
    hostelType: { type: String, required: true },
    roomPreference: { type: String, required: true },
    floorPreference: { type: String },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

HostelApplicationSchema.index({ studentId: 1, status: 1 });
HostelApplicationSchema.index({ status: 1, createdAt: -1 });

const HostelApplication = models.HostelApplication || model<IHostelApplication>("HostelApplication", HostelApplicationSchema);

export default HostelApplication;
