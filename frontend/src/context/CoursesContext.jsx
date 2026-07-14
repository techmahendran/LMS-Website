import { createContext, useContext, useEffect, useState } from "react";
import fallbackCourses from "../assets/dummyHdata";
import { api } from "../services/api";

const CoursesContext = createContext(fallbackCourses);
// Keep build-generated asset URLs out of MongoDB; the UI maps each record back
// to its bundled image so deployments can safely generate new asset hashes.
const serializableCourses = fallbackCourses.map((course) => ({ ...course, image: "" }));

export function CoursesProvider({ children }) {
  const [courses, setCourses] = useState(fallbackCourses);
  useEffect(() => {
    let active = true;
    api("/courses").then(async (remote) => {
      if (!remote.length) {
        await api("/courses/seed", { method: "POST", body: JSON.stringify(serializableCourses) });
        return api("/courses");
      }
      return remote;
    }).then((remote) => {
      if (!active || !remote?.length) return;
      setCourses(remote.map((course) => ({ ...course, id: course.legacyId, image: course.image || fallbackCourses.find((item) => item.id === course.legacyId)?.image })));
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return <CoursesContext.Provider value={courses}>{children}</CoursesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCourses = () => useContext(CoursesContext);
