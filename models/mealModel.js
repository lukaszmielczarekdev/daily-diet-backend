import mongoose from "mongoose";

const mealSchema = mongoose.Schema({
  title: String,
  id: String,
  products: [Object],
  nutrients: { kcal: Number, protein: Number, carbs: Number, fat: Number },
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
});

export default mongoose.model("Meal", mealSchema);
