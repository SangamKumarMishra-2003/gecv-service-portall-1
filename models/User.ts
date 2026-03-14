import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["student", "faculty", "academics", "hostel-incharge"],
      required: true,
    },
    // Student specific fields
    regNo: {
      type: String,
      unique: true,
      sparse: true, // Allow null/undefined for other roles
    },
    rollNo: {
      type: String,
    },
    fatherName: {
        type: String,
    },
    dob: {
        type: Date
    },
    mobile: {
        type: String
    },
    // Additional student academic fields
    course: {
        type: String // e.g., "B.Tech", "M.Tech"
    },
    branch: {
        type: String // e.g., "Computer Science", "Mechanical"
    },
    session: {
        type: String // e.g., "2024-2025"
    },
    semester: {
        type: Number // 1-8
    },
    year: {
        type: Number // 1-4
    },
    motherName: {
        type: String
    },
    admissionDate: {
        type: Date
    },
    expectedCompletionYear: {
        type: String
    },
    category: {
        type: String // e.g., "General", "SC", "ST", "OBC"
    }
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;
