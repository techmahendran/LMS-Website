import "dotenv/config";
/* global process */
import dns from "node:dns";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import { Contact, Course, Enrollment, Progress, Rating } from "./models.js";

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173").split(","),
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

const requireUser = (req, res, next) => {
  const userId = req.get("x-user-id");
  if (!userId) return res.status(401).json({ message: "Sign in is required" });
  req.userId = userId;
  next();
};
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

app.get("/api/health", (req, res) =>
  res.json({ ok: true, database: mongoose.connection.readyState === 1 }),
);
app.get(
  "/api/courses",
  asyncRoute(async (req, res) =>
    res.json(await Course.find().sort({ legacyId: 1 }).lean()),
  ),
);
app.get(
  "/api/courses/:id",
  asyncRoute(async (req, res) => {
    const course = await Course.findOne({
      legacyId: Number(req.params.id),
    }).lean();
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  }),
);
app.post(
  "/api/courses/seed",
  asyncRoute(async (req, res) => {
    if (await Course.exists({}))
      return res.status(409).json({ message: "Courses already seeded" });
    const courses = Array.isArray(req.body) ? req.body.slice(0, 100) : [];
    if (!courses.length)
      return res.status(400).json({ message: "Course data is required" });
    const clean = courses.map(
      ({
        id,
        name,
        teacher,
        image,
        rating,
        isFree,
        price,
        overview,
        lectures,
      }) => ({
        legacyId: Number(id),
        name,
        teacher,
        image,
        rating,
        isFree,
        price,
        overview,
        lectures,
      }),
    );
    await Course.insertMany(clean);
    res.status(201).json({ inserted: clean.length });
  }),
);

app.get(
  "/api/enrollments",
  requireUser,
  asyncRoute(async (req, res) =>
    res.json(
      await Enrollment.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .lean(),
    ),
  ),
);
app.post(
  "/api/enrollments",
  requireUser,
  asyncRoute(async (req, res) => {
    const course = await Course.findOne({
      legacyId: Number(req.body.courseId),
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    const amount =
      course.isFree || !course.price ? 0 : Number(course.price.sale || 0);
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: req.userId, courseId: course.legacyId },
      {
        userId: req.userId,
        courseId: course.legacyId,
        courseName: course.name,
        amount,
        method: req.body.method || "free",
        status: amount ? "demo-success" : "free",
      },
      { upsert: true, new: true, runValidators: true },
    );
    res.status(201).json(enrollment);
  }),
);

app.get(
  "/api/progress/:courseId",
  requireUser,
  asyncRoute(async (req, res) =>
    res.json(
      (await Progress.findOne({
        userId: req.userId,
        courseId: Number(req.params.courseId),
      }).lean()) || {
        completed: [],
        watchedSeconds: 0,
        currentChapterId: null,
      },
    ),
  ),
);
app.put(
  "/api/progress/:courseId",
  requireUser,
  asyncRoute(async (req, res) => {
    const {
      completed = [],
      watchedSeconds = 0,
      currentChapterId = null,
    } = req.body;
    const progress = await Progress.findOneAndUpdate(
      { userId: req.userId, courseId: Number(req.params.courseId) },
      {
        userId: req.userId,
        courseId: Number(req.params.courseId),
        completed,
        watchedSeconds,
        currentChapterId,
      },
      { upsert: true, new: true, runValidators: true },
    );
    res.json(progress);
  }),
);
app.put(
  "/api/ratings/:courseId",
  requireUser,
  asyncRoute(async (req, res) => {
    const rating = await Rating.findOneAndUpdate(
      { userId: req.userId, courseId: Number(req.params.courseId) },
      { value: Number(req.body.value) },
      { upsert: true, new: true, runValidators: true },
    );
    res.json(rating);
  }),
);
app.post(
  "/api/contact",
  asyncRoute(async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim())
      return res
        .status(400)
        .json({ message: "Name, email and message are required" });
    res
      .status(201)
      .json(
        await Contact.create({
          name: name.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
        }),
      );
  }),
);

// Express recognizes error middleware by its four-argument signature.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);
  res
    .status(error.name === "ValidationError" ? 400 : 500)
    .json({ message: error.message || "Server error" });
});

const port = Number(process.env.PORT || 5000);
if (!process.env.MONGODB_URI)
  throw new Error("MONGODB_URI is missing in backend/.env");

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "skillforge" });
} catch (error) {
  const isSrvDnsRefusal =
    error.code === "ECONNREFUSED" && error.syscall === "querySrv";
  if (!isSrvDnsRefusal) throw error;

  const fallbackDns = (process.env.DNS_SERVERS || "1.1.1.1,8.8.8.8")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  console.warn(
    `MongoDB SRV lookup was refused; retrying with DNS servers: ${fallbackDns.join(", ")}`,
  );
  dns.setServers(fallbackDns);
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "skillforge" });
}
app.listen(port, () =>
  console.log(`SkillForge API running at http://localhost:${port}`),
);
