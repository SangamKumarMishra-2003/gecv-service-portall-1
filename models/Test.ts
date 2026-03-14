import mongoose, { Schema } from "mongoose";

const TestSchema = new Schema({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String },
  questions: [
    {
      question: String,
      options: [String],
      answer: String,
    },
  ],
  testDate: { type: Date, required: true },
  testTime: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Test || mongoose.model("Test", TestSchema);
