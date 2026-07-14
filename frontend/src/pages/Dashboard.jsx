import { BookOpen, CheckCircle2, Clock, GraduationCap, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { useCourses } from "../context/CoursesContext";
import { api } from "../services/api";
import PageLayout from "../components/PageLayout";
import { getLearningProgress, getProgressPercent } from "../utils/learningProgress";

export default function Dashboard() {
  const courses = useCourses();
  const { user } = useUser();
  const [remoteEnrollments, setRemoteEnrollments] = useState(null);
  useEffect(() => {
    if (!user) return;
    api("/enrollments", { userId: user.id }).then(setRemoteEnrollments).catch(() => {});
  }, [user]);
  const enrolledCourses = (() => {
    try {
      const enrollments = remoteEnrollments || JSON.parse(localStorage.getItem("enrollments") || "[]");
      if (!Array.isArray(enrollments)) return [];
      return enrollments.map((enrollment) => {
        const course = courses.find((item) => String(item.id) === String(enrollment.courseId));
        if (!course) return null;
        const learning = getLearningProgress(course.id);
        const progress = getProgressPercent(course, learning.completed);
        return { ...course, progress, watchedSeconds: learning.watchedSeconds };
      }).filter(Boolean);
    } catch {
      return [];
    }
  })();

  const completed = enrolledCourses.filter((course) => course.progress === 100).length;
  const hours = enrolledCourses.reduce((total, course) => total + course.watchedSeconds / 3600, 0);
  const stats = [[BookOpen, "Courses", enrolledCourses.length], [Clock, "Hours learned", hours.toFixed(1)], [Trophy, "Certificates", completed]];

  return <PageLayout><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
    <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-200"><GraduationCap size={27}/></div><div><h1 className="text-3xl font-black">My learning</h1><p className="mt-1 text-slate-500">Welcome back. Keep up your momentum.</p></div></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3">{stats.map(([Icon, label, value]) => <div key={label} className="rounded-2xl bg-white p-6 shadow-sm"><Icon className="text-cyan-600"/><strong className="mt-4 block text-3xl">{value}</strong><span className="text-slate-500">{label}</span></div>)}</div>
    <h2 className="mt-12 text-2xl font-bold">Continue learning</h2>
    {enrolledCourses.length ? <div className="mt-5 grid gap-5 md:grid-cols-2">{enrolledCourses.map((course) => <article key={course.id} className="flex flex-col gap-5 rounded-2xl bg-white p-4 shadow-sm sm:flex-row"><img src={course.image} className="aspect-video w-full rounded-xl object-cover sm:w-44" alt={course.name}/><div className="min-w-0 flex-1"><h3 className="truncate font-bold">{course.name}</h3><p className="mt-1 text-sm text-slate-500">{course.teacher}</p><div className="mt-5 h-2 overflow-hidden rounded bg-slate-100"><div className="h-full bg-cyan-600" style={{ width: `${course.progress}%` }}/></div><div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span className="flex items-center gap-1"><CheckCircle2 size={14}/>{course.progress}% complete</span><Link className="font-semibold text-cyan-700" to={`/learn/${course.id}`}>{course.progress ? "Continue" : "Start course"}</Link></div></div></article>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center"><GraduationCap className="mx-auto text-cyan-600" size={36}/><h3 className="mt-4 text-lg font-bold">No enrolled courses yet</h3><p className="mt-2 text-sm text-slate-500">Complete course checkout and it will appear here.</p><Link to="/courses" className="mt-5 inline-block rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white">Browse courses</Link></div>}
  </section></PageLayout>;
}
