import { CheckCircle2, ChevronLeft, LoaderCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useUser } from "@clerk/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Slide, ToastContainer, toast } from "react-toastify";
import { useCourses } from "../context/CoursesContext";
import { api } from "../services/api";
import PageLayout from "../components/PageLayout";
import PaymentMethod from "../components/PaymentMethod";

const initialValues = { upi: "", cardName: "", cardNumber: "", expiry: "", cvv: "", bank: "" };

export default function Checkout() {
  const courses = useCourses();
  const { user } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find((item) => String(item.id) === id);
  const [method, setMethod] = useState("upi");
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  if (!course) return <PageLayout><div className="px-4 py-24 text-center"><h1 className="text-3xl font-bold">Course not found</h1><Link to="/courses" className="mt-5 inline-block text-cyan-700">Back to courses</Link></div></PageLayout>;

  const amount = course.isFree || !course.price ? 0 : Number(course.price.sale || 0);
  const updateValue = (event) => {
    let { name, value } = event.target;
    if (name === "cardNumber") value = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    if (name === "expiry") value = value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
    if (name === "cvv") value = value.replace(/\D/g, "").slice(0, 3);
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (method === "upi" && !/^[\w.-]{2,}@[\w.-]{2,}$/.test(values.upi)) next.upi = "Enter a valid UPI ID";
    if (method === "card") {
      if (values.cardName.trim().length < 3) next.cardName = "Enter the cardholder name";
      if (values.cardNumber.replace(/\s/g, "").length !== 16) next.cardNumber = "Enter a valid 16-digit card number";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.expiry)) next.expiry = "Use MM/YY format";
      if (!/^\d{3}$/.test(values.cvv)) next.cvv = "Enter a valid CVV";
    }
    if (method === "netbanking" && !values.bank) next.bank = "Select your bank";
    setErrors(next);
    return !Object.keys(next).length;
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    if (!validate()) { toast.error("Please check your payment details."); return; }
    setProcessing(true);
    try {
      if (!user) throw new Error("Please sign in before enrolling");
      await api("/enrollments", { userId: user.id, method: "POST", body: JSON.stringify({ courseId: course.id, method }) });
      const enrollment = { courseId: course.id, courseName: course.name, amount, method, paidAt: new Date().toISOString(), status: amount ? "demo-success" : "free" };
      const previous = JSON.parse(localStorage.getItem("enrollments") || "[]");
      localStorage.setItem("enrollments", JSON.stringify([...previous.filter((item) => String(item.courseId) !== String(course.id)), enrollment]));
      toast.success(amount ? "Demo payment successful! Course enrolled." : "Successfully enrolled in the free course!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) { toast.error(error.message || "Payment could not be completed. Please try again."); setProcessing(false); }
  };

  return <PageLayout>
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
      <Link to={`/course/${course.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-cyan-700"><ChevronLeft size={18}/>Back to course</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-start">
        <form onSubmit={submitPayment} className="rounded-2xl bg-white p-5 shadow-sm sm:p-8"><PaymentMethod method={method} setMethod={setMethod} values={values} onChange={updateValue} errors={errors}/><button disabled={processing} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3.5 font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70">{processing ? <><LoaderCircle className="animate-spin" size={19}/>Processing…</> : amount ? `Pay ₹${amount}` : "Enroll for free"}</button><p className="mt-3 text-center text-xs text-amber-700">Demo checkout only — no real money will be charged.</p></form>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold">Order summary</h2><img src={course.image} alt="" className="mt-5 aspect-video w-full rounded-xl object-cover"/><h3 className="mt-4 font-bold">{course.name}</h3><p className="mt-1 text-sm text-slate-500">by {course.teacher}</p><div className="my-5 border-t border-slate-200"/><div className="flex justify-between"><span className="text-slate-600">Course price</span><strong>{amount ? `₹${amount}` : "Free"}</strong></div><div className="mt-5 space-y-2 text-sm text-slate-600"><p className="flex gap-2"><CheckCircle2 size={17} className="text-emerald-600"/>Lifetime course access</p><p className="flex gap-2"><ShieldCheck size={17} className="text-emerald-600"/>Secure checkout</p></div></aside>
      </div>
    </section>
    <ToastContainer position="top-right" autoClose={3000} transition={Slide} theme="colored"/>
  </PageLayout>;
}
