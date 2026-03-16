import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IServiceRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  serviceType: "Bonafide" | "FeeStructure" | "TC" | "CharacterCertificate" | "NOC" | "NoDues";
  status: "Pending" | "Approved" | "Rejected";
  
  // Common field
  purpose?: string;
  
  // Service-specific fields
  // For Bonafide & Character Certificate & NOC
  purposeType?: string; // Education / Scholarship / Internship / Other
  
  // For Fee Structure
  academicYear?: string;
  
  // For TC (Transfer Certificate)
  reasonForLeaving?: string;
  lastSemesterCompleted?: number;
  
  // For NOC
  organizationName?: string;
  
  // For No Dues
  departmentClearances?: {
    library: boolean;
    hostel: boolean;
    lab: boolean;
    accounts: boolean;
    sports: boolean;
  };
  
  // Admin fields
  rejectionReason?: string;
  documentUrl?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    serviceType: {
      type: String,
      enum: ["Bonafide", "FeeStructure", "TC", "CharacterCertificate", "NOC", "NoDues"],
      required: [true, "Service type is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    // Common field
    purpose: {
      type: String,
    },
    // Service-specific fields
    purposeType: {
      type: String,
      enum: ["Education", "Scholarship", "Internship", "Employment", "Bank", "Passport", "HigherStudies", "Job", "Event", "Visit", "State Level", "Central Level", "Credit Card", "Other"],
    },
    academicYear: {
      type: String,
    },
    reasonForLeaving: {
      type: String,
    },
    lastSemesterCompleted: {
      type: Number,
    },
    organizationName: {
      type: String,
    },
    departmentClearances: {
      library: { type: Boolean, default: false },
      hostel: { type: Boolean, default: false },
      lab: { type: Boolean, default: false },
      accounts: { type: Boolean, default: false },
      sports: { type: Boolean, default: false },
    },
    // Fee fields for Fee Structure
    admissionFee: {
      type: Number,
    },
    tuitionFee: {
      type: Number,
    },
    registrationFee: {
      type: Number,
    },
    examFee: {
      type: Number,
    },
    developmentFee: {
      type: Number,
    },
    otherCharges: {
      type: Number,
    },
    // Admin fields
    rejectionReason: {
      type: String,
    },
    documentUrl: {
      type: String,
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
  },
  { timestamps: true }
);

// Index for faster queries
ServiceRequestSchema.index({ studentId: 1, status: 1 });
ServiceRequestSchema.index({ status: 1, createdAt: -1 });

const ServiceRequest = models.ServiceRequest || model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);

export default ServiceRequest;
