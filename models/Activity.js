import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  category: { type: String, required: true }, //'body', 'diet', 'mind', 'sleep'
  tier: { type: String, required: true }, //  'Came', 'Saw', 'Conquered'
  description: { type: String, required: true },
  xp: { type: Number, required: true },
});

export default mongoose.model("Activity", activitySchema);
