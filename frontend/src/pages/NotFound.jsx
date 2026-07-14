import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
export default function NotFound(){return <PageLayout><section className="px-4 py-28 text-center"><p className="text-7xl font-black text-cyan-600">404</p><h1 className="mt-4 text-3xl font-bold">Page not found</h1><p className="mt-3 text-slate-500">The page you requested doesn’t exist.</p><Link to="/" className="mt-7 inline-block rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white">Back home</Link></section></PageLayout>}
