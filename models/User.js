import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  streak: { type: Number, default: 0 },
  totalXp: { type: Number, default: 0 },
  xpBreakdown: {
    body: { type: Number, default: 0 },
    mind: { type: Number, default: 0 },
    sleep: { type: Number, default: 0 },
    diet: { type: Number, default: 0 },
  },
  activities: [
    {
      activityId: { type: mongoose.Schema.Types.ObjectId },
      category: { type: String },
      date: { type: Date, default: Date.now },
      description: { type: String },
      xp: { type: Number },
    },
  ],
  dailyActivities: [
    {
      activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
      category: { type: String },
      description: { type: String },
      xp: { type: Number },
      completed: { type: Boolean, default: false },
    },
  ],
});

export default mongoose.model("User", userSchema);
