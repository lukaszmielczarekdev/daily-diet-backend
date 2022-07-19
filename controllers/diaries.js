import mongoose from "mongoose";
import Diary from "../models/diaryModel.js";

const calculateAverageRate = (ratingPrivate) => {
  if (ratingPrivate) {
    return (
      ratingPrivate.reduce((acc, rating) => acc + rating.rate, 0) /
      ratingPrivate.length
    );
  } else {
    return 0;
  }
};

export const getDiaries = async (req, res) => {
  try {
    const diaries = await Diary.find({ fields: { ratingPrivate: false } });

    res.status(200).json(diaries);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createDiary = async (req, res) => {
  const diary = req.body;

  const newDiary = new Diary({
    ...diary,
    creator: req.userId,
    createdAt: new Date().toLocaleDateString("en-GB"),
  });

  try {
    await newDiary.save();

    res.status(201).json(newDiary);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateDiary = async (req, res) => {
  const { id: _id } = req.params;

  const diary = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send("Diary not found");

    const updatedDiary = await Diary.findOneAndUpdate(
      { _id, creator: req.userId },
      { ...diary },
      {
        new: true,
      }
    );
    res.json({
      _id: updatedDiary._id,
      title: updatedDiary.title,
      id: updatedDiary.id,
      meals: updatedDiary.meals,
      nutrients: updatedDiary.nutrients,
      calorieAdjustment: updatedDiary.calorieAdjustment,
      creator: updatedDiary.creator,
      createdAt: updatedDiary.createdAt,
      private: updatedDiary.private,
      ratingPublic: {
        average: calculateAverageRate(updatedDiary.ratingPrivate),
        rates: updatedDiary.ratingPrivate.length,
      },
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteDiary = async (req, res) => {
  const { id: _id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send("Diary not found");

    await Diary.findOneAndRemove({ _id, creator: req.userId });

    res.json({ message: "Diary deleted" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const rateDiary = async (req, res) => {
  const { id: _id } = req.params;

  const { rate } = req.body;

  try {
    const existingDiary = await Diary.findOne({ _id });
    if (!existingDiary)
      return res.status(404).json({ message: "Diary not found" });

    if (existingDiary.creator === req.userId)
      return res
        .status(400)
        .json({ message: "You cannot rate your own diary" });

    // const alreadyRatedByTheUser = Diary.find({
    //   "ratingPrivate.user": `${req.userId}`,
    // });

    const updatedDiary = await Diary.findOneAndUpdate(
      { _id },
      {
        ratingPrivate: [
          ...existingDiary.ratingPrivate,
          { user: req.userId, rate },
        ],
      },
      {
        new: true,
      }
    );

    res.json({
      _id: updatedDiary._id,
      title: updatedDiary.title,
      id: updatedDiary.id,
      meals: updatedDiary.meals,
      nutrients: updatedDiary.nutrients,
      calorieAdjustment: updatedDiary.calorieAdjustment,
      creator: updatedDiary.creator,
      createdAt: updatedDiary.createdAt,
      private: updatedDiary.private,
      ratingPublic: {
        average: calculateAverageRate(updatedDiary.ratingPrivate),
        rates: updatedDiary.ratingPrivate.length,
      },
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
