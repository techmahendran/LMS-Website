import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useCourses } from "../context/CoursesContext";
import CourseCard from "../components/CourseCard";
import PageLayout from "../components/PageLayout";

export default function Courses() {
  const courses = useCourses();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular");
  const visible = useMemo(() => {
    const result = courses.filter((course) => `${course.name} ${course.teacher}`.toLowerCase().includes(query.toLowerCase()));
    return sort === "price" ? [...result].sort((a, b) => (a.price?.sale || 0) - (b.price?.sale || 0)) : result;
  }, [courses, query, sort]);

  return <PageLayout>
    <section className="bg-linear-to-br from-slate-950 via-cyan-950 to-slate-900 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl"><p className="font-semibold text-cyan-300">Learn without limits</p><h1 className="mt-2 text-4xl font-black sm:text-5xl">Explore our courses</h1><p className="mt-4 max-w-2xl text-slate-300">Practical, project-based learning taught by experienced instructors.</p></div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 px-4"><Search size={19} className="text-slate-400"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses or instructors" className="w-full py-3 outline-none"/></label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4"><SlidersHorizontal size={18}/><select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white py-3 outline-none"><option value="popular">Most popular</option><option value="price">Lowest price</option></select></label>
      </div>
      <p className="mb-5 text-sm text-slate-500">{visible.length} courses found</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visible.map((course) => <CourseCard key={course.id} course={course}/>)}</div>
      {!visible.length && <div className="py-20 text-center text-slate-500">No courses match your search.</div>}
    </section>
  </PageLayout>;
}
