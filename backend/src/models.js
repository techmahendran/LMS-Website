import mongoose from "mongoose";

const { Schema, model } = mongoose;
const chapterSchema = new Schema({ id: String, name: String, topic: String, durationMin: Number, videoUrl: String }, { _id: false });
const lectureSchema = new Schema({ id: String, title: String, durationMin: Number, chapters: [chapterSchema] }, { _id: false });

export const Course = model("Course", new Schema({
  legacyId: { type: Number, unique: true, index: true }, name: { type: String, required: true }, teacher: String,
  image: String, rating: { type: Number, default: 0 }, isFree: Boolean,
  price: { original: Number, sale: Number }, overview: String, lectures: [lectureSchema]
}, { timestamps: true }));

export const Enrollment = model("Enrollment", new Schema({
  userId: { type: String, required: true, index: true }, courseId: { type: Number, required: true },
  courseName: String, amount: Number, method: String, status: String
}, { timestamps: true }));

Enrollment.schema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Progress = model("Progress", new Schema({
  userId: { type: String, required: true, index: true }, courseId: { type: Number, required: true },
  completed: [String], watchedSeconds: { type: Number, default: 0 }, currentChapterId: String
}, { timestamps: true }));
Progress.schema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Rating = model("Rating", new Schema({
  userId: { type: String, required: true }, courseId: { type: Number, required: true }, value: { type: Number, min: 1, max: 5 }
}, { timestamps: true }));
Rating.schema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Contact = model("Contact", new Schema({
  name: { type: String, required: true }, email: { type: String, required: true }, subject: String,
  message: { type: String, required: true }, status: { type: String, default: "new" }
}, { timestamps: true }));
