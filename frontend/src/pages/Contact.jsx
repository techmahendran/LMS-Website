import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import PageLayout from "../components/PageLayout";
import { api } from "../services/api";

export default function Contact() {
  const [status, setStatus] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("Sending...");
    try {
      await api("/contact", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      form.reset();
      setStatus("Message sent successfully.");
    } catch (error) { setStatus(error.message); }
  };
  return <PageLayout><section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2"><div><p className="font-semibold text-cyan-700">Contact us</p><h1 className="mt-2 text-4xl font-black">We’d love to hear from you</h1><p className="mt-4 text-slate-600">Questions about a course, your account, or teaching on SkillForge? Send us a message.</p><div className="mt-8 space-y-5"><p className="flex gap-3"><Mail className="text-cyan-700"/>support@skillforge.com</p><p className="flex gap-3"><Phone className="text-cyan-700"/>+91 98765 43210</p><p className="flex gap-3"><MapPin className="text-cyan-700"/>Chennai, Tamil Nadu, India</p></div></div><form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-lg sm:p-8"><input name="name" required placeholder="Your name" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-cyan-600"/><input name="email" required type="email" placeholder="Email address" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-cyan-600"/><select name="subject" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"><option>Course enquiry</option><option>Account support</option><option>Become an instructor</option></select><textarea name="message" required rows="5" placeholder="How can we help?" className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-cyan-600"/><button className="w-full rounded-xl bg-cyan-600 py-3 font-bold text-white hover:bg-cyan-700">Send message</button>{status && <p className="text-center text-sm text-cyan-700">{status}</p>}</form></section></PageLayout>;
}
