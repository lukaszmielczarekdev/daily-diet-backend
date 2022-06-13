import mongoose from "mongoose";

const diarySchema = mongoose.Schema({
  title: String,
  id: String,
  meals: [Object],
  nutrients: { kcal: Number, protein: Number, carbs: Number, fat: Number },
  calorieAdjustment: {
    type: Number,
    default: 0,
  },
  creator: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  private: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Diary", diarySchema);
