import mongoose from "mongoose";

const diarySchema = mongoose.Schema({
  date: String,
  name: String,
  demand: { kcal: Number, protein: Number, carbs: Number, fat: Number },
  meals: [Object],
  nutrients: { kcal: Number, protein: Number, carbs: Number, fat: Number },
  demandCoverage: {
    kcal: { bgcolor: String, completed: Number, label: String },
    protein: { bgcolor: String, completed: Number, label: String },
    carbs: { bgcolor: String, completed: Number, label: String },
    fat: { bgcolor: String, completed: Number, label: String },
  },
});

export default mongoose.model("DiaryModel", diarySchema);
