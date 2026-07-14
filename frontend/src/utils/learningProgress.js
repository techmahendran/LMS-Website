const keyFor = (courseId) => `learningProgress:${courseId}`;

export function getLearningProgress(courseId) {
  try {
    const value = JSON.parse(localStorage.getItem(keyFor(courseId)) || "{}");
    return {
      completed: Array.isArray(value.completed) ? value.completed : [],
      watchedSeconds: Number(value.watchedSeconds) || 0,
      currentChapterId: value.currentChapterId || null,
      updatedAt: value.updatedAt || null,
    };
  } catch {
    return { completed: [], watchedSeconds: 0, currentChapterId: null, updatedAt: null };
  }
}

export function saveLearningProgress(courseId, progress) {
  const next = { ...progress, updatedAt: new Date().toISOString() };
  localStorage.setItem(keyFor(courseId), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("learning-progress", { detail: { courseId, progress: next } }));
  return next;
}

export function getCourseChapters(course) {
  return course?.lectures?.flatMap((lecture) => lecture.chapters || []) || [];
}

export function getProgressPercent(course, completed = []) {
  const chapters = getCourseChapters(course);
  if (!chapters.length) return 0;
  return Math.round((chapters.filter((chapter) => completed.includes(chapter.id)).length / chapters.length) * 100);
}

export function formatWatchTime(seconds) {
  const totalMinutes = Math.floor((Number(seconds) || 0) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function toEmbedUrl(url = "") {
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const youtubeMatch = url.match(/[?&]v=([^?&/]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  return url;
}
