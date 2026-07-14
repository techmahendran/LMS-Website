import { Check, CheckCircle2, ChevronLeft, Clock3, Menu, PlayCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/react";
import { Link, useParams } from "react-router-dom";
import { Slide, ToastContainer, toast } from "react-toastify";
import { useCourses } from "../context/CoursesContext";
import { api } from "../services/api";
import PageLayout from "../components/PageLayout";
import { formatWatchTime, getCourseChapters, getLearningProgress, getProgressPercent, saveLearningProgress, toEmbedUrl } from "../utils/learningProgress";

export default function CoursePlayer() {
  const courses = useCourses();
  const { user } = useUser();
  const { id } = useParams();
  const course = courses.find((item) => String(item.id) === id);
  const chapters = useMemo(() => getCourseChapters(course), [course]);
  const stored = useMemo(() => getLearningProgress(id), [id]);
  const initialChapter = chapters.find((item) => item.id === stored.currentChapterId) || chapters[0];
  const [current, setCurrent] = useState(initialChapter);
  const [completed, setCompleted] = useState(stored.completed);
  const [watchedSeconds, setWatchedSeconds] = useState(stored.watchedSeconds);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    api(`/progress/${id}`, { userId: user.id }).then((remote) => {
      setCompleted(remote.completed || []);
      setWatchedSeconds(remote.watchedSeconds || 0);
      const chapter = chapters.find((item) => item.id === remote.currentChapterId);
      if (chapter) setCurrent(chapter);
    }).catch(() => {});
  }, [user, id, chapters]);

  const persistProgress = (value) => {
    saveLearningProgress(id, value);
    if (user) api(`/progress/${id}`, { userId: user.id, method: "PUT", body: JSON.stringify(value) }).catch(() => {});
  };

  useEffect(() => {
    if (!course || !current) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setWatchedSeconds((seconds) => {
        const next = seconds + 5;
        persistProgress({ completed, watchedSeconds: next, currentChapterId: current.id });
        return next;
      });
    }, 5000);
    return () => window.clearInterval(timer);
  // persistProgress always writes the latest values supplied by this timer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, current, completed, user]);

  if (!course) return <PageLayout><div className="px-4 py-24 text-center"><h1 className="text-3xl font-bold">Course not found</h1><Link to="/courses" className="mt-5 inline-block text-cyan-700">Browse courses</Link></div></PageLayout>;
  if (!current) return <PageLayout><div className="px-4 py-24 text-center"><h1 className="text-3xl font-bold">Lessons are coming soon</h1><Link to={`/course/${course.id}`} className="mt-5 inline-block text-cyan-700">Back to course</Link></div></PageLayout>;

  const progress = getProgressPercent(course, completed);
  const selectChapter = (chapter) => {
    setCurrent(chapter); setSidebarOpen(false);
    persistProgress({ completed, watchedSeconds, currentChapterId: chapter.id });
  };
  const toggleComplete = () => {
    const isDone = completed.includes(current.id);
    const next = isDone ? completed.filter((item) => item !== current.id) : [...completed, current.id];
    setCompleted(next);
    persistProgress({ completed: next, watchedSeconds, currentChapterId: current.id });
    toast.success(isDone ? "Lesson marked incomplete" : "Lesson completed!");
    if (!isDone) {
      const nextChapter = chapters[chapters.findIndex((item) => item.id === current.id) + 1];
      if (nextChapter) window.setTimeout(() => selectChapter(nextChapter), 500);
    }
  };

  const curriculum = <div className="h-full overflow-y-auto bg-white"><div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><h2 className="font-bold">Course content</h2><button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X/></button></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-cyan-600" style={{ width: `${progress}%` }}/></div><p className="mt-2 text-xs text-slate-500">{progress}% complete · {formatWatchTime(watchedSeconds)} watched</p></div>{course.lectures.map((lecture, index) => <section key={lecture.id} className="border-b border-slate-100"><h3 className="bg-slate-50 px-4 py-3 text-sm font-bold">{index + 1}. {lecture.title}</h3>{lecture.chapters.map((chapter) => { const active = current.id === chapter.id; const done = completed.includes(chapter.id); return <button key={chapter.id} onClick={() => selectChapter(chapter)} className={`flex w-full gap-3 px-4 py-3 text-left transition ${active ? "bg-cyan-50 text-cyan-800" : "hover:bg-slate-50"}`}><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>{done ? <Check size={13}/> : <PlayCircle size={13}/>}</span><span className="min-w-0"><span className="block text-sm font-medium">{chapter.name}</span><span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 size={12}/>{chapter.durationMin} min</span></span></button>})}</section>)}</div>;

  return <PageLayout><div className="bg-slate-950 text-white"><div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3"><Link to={`/course/${course.id}`} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ChevronLeft size={18}/><span className="hidden sm:inline">Back to course</span></Link><p className="min-w-0 truncate font-bold">{course.name}</p><button onClick={() => setSidebarOpen(true)} className="lg:hidden" aria-label="Open curriculum"><Menu/></button></div></div>
    <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[1fr_360px]"><main className="min-w-0 bg-slate-900"><div className="aspect-video w-full bg-black"><iframe key={current.id} src={toEmbedUrl(current.videoUrl)} title={current.name} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/></div><div className="bg-white p-5 sm:p-8"><p className="text-sm font-semibold text-cyan-700">{current.topic}</p><h1 className="mt-2 text-2xl font-black text-slate-900">{current.name}</h1><div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">Active watch time: {formatWatchTime(watchedSeconds)}</p><button onClick={toggleComplete} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold ${completed.includes(current.id) ? "bg-emerald-50 text-emerald-700" : "bg-cyan-600 text-white hover:bg-cyan-700"}`}><CheckCircle2 size={18}/>{completed.includes(current.id) ? "Completed" : "Mark complete"}</button></div></div></main><aside className="hidden max-h-[calc(100vh-5rem)] lg:block">{curriculum}</aside></div>
    {sidebarOpen && <div className="fixed inset-0 z-50 bg-slate-950/60 lg:hidden" onClick={() => setSidebarOpen(false)}><aside className="ml-auto h-full w-[88%] max-w-sm" onClick={(event) => event.stopPropagation()}>{curriculum}</aside></div>}
    <ToastContainer position="top-right" autoClose={2500} transition={Slide} theme="colored"/>
  </PageLayout>;
}
