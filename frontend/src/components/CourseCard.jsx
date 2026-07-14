import { Clock, Star, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  const price = course.isFree || !course.price ? "Free" : `₹${course.price.sale}`;
  return (
    <Link to={`/course/${course.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="aspect-video overflow-hidden bg-slate-100">
        <img src={course.image} alt={course.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
      </div>
      <div className="p-5">
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">{course.category || "Development"}</span>
        <h2 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900">{course.name}</h2>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500"><User size={15} />{course.teacher}</div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1 text-sm text-amber-500"><Star size={16} fill="currentColor" /> {course.rating || "4.8"}</span>
          <span className="flex items-center gap-1 text-sm text-slate-500"><Clock size={15} /> {course.duration || "8 weeks"}</span>
          <strong className="text-cyan-700">{price}</strong>
        </div>
      </div>
    </Link>
  );
}
