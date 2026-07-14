import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import "./index.css";
import { CoursesProvider } from "./context/CoursesContext";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publish");
}

createRoot(document.getElementById("root")).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    afterSignOutUrl="/"
  >
    <BrowserRouter>
      <CoursesProvider><App /></CoursesProvider>
    </BrowserRouter>
  </ClerkProvider>
);
