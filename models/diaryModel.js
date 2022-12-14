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
    type: String,
    default: new Date().toLocaleDateString("en-GB"),
  },
  private: {
    type: Boolean,
    default: false,
  },
  ratingPrivate: [Object],
  ratingPublic: {
    average: {
      type: Number,
      default: 0,
    },
    rates: {
      type: Number,
      default: 0,
    },
  },
});

export default mongoose.model("Diary", diarySchema);
