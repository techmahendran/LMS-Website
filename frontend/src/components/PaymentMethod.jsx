import { CreditCard, Landmark, LockKeyhole, Smartphone } from "lucide-react";

const methods = [
  { id: "upi", label: "UPI", detail: "Google Pay, PhonePe, Paytm", icon: Smartphone },
  { id: "card", label: "Card", detail: "Visa, Mastercard, RuPay", icon: CreditCard },
  { id: "netbanking", label: "Net banking", detail: "All major Indian banks", icon: Landmark },
];

export default function PaymentMethod({ method, setMethod, values, onChange, errors }) {
  return <div>
    <h2 className="text-xl font-bold text-slate-900">Payment method</h2>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      {methods.map(({ id, label, detail, icon: Icon }) => <button key={id} type="button" onClick={() => setMethod(id)} className={`rounded-xl border p-4 text-left transition ${method === id ? "border-cyan-600 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 hover:border-slate-300"}`}>
        <Icon className={method === id ? "text-cyan-700" : "text-slate-500"} size={22}/><strong className="mt-3 block text-sm">{label}</strong><span className="mt-1 block text-xs text-slate-500">{detail}</span>
      </button>)}
    </div>

    <div className="mt-6">
      {method === "upi" && <Field label="UPI ID" name="upi" value={values.upi} onChange={onChange} placeholder="yourname@bank" error={errors.upi}/>} 
      {method === "card" && <div className="space-y-4">
        <Field label="Name on card" name="cardName" value={values.cardName} onChange={onChange} placeholder="Name as printed on card" error={errors.cardName}/>
        <Field label="Card number" name="cardNumber" value={values.cardNumber} onChange={onChange} placeholder="1234 5678 9012 3456" inputMode="numeric" maxLength={19} error={errors.cardNumber}/>
        <div className="grid grid-cols-2 gap-4"><Field label="Expiry" name="expiry" value={values.expiry} onChange={onChange} placeholder="MM/YY" inputMode="numeric" maxLength={5} error={errors.expiry}/><Field label="CVV" name="cvv" value={values.cvv} onChange={onChange} placeholder="•••" inputMode="numeric" maxLength={3} error={errors.cvv}/></div>
      </div>}
      {method === "netbanking" && <label className="block"><span className="text-sm font-semibold text-slate-700">Select your bank</span><select name="bank" value={values.bank} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-cyan-600"><option value="">Choose a bank</option><option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra Bank</option></select>{errors.bank && <span className="mt-1 block text-xs text-red-600">{errors.bank}</span>}</label>}
    </div>
    <p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><LockKeyhole size={14}/>Your payment details are encrypted and securely processed.</p>
  </div>;
}

function Field({ label, error, ...props }) {
  return <label className="block"><span className="text-sm font-semibold text-slate-700">{label}</span><input {...props} className={`mt-2 w-full rounded-xl border px-4 py-3 outline-cyan-600 ${error ? "border-red-400" : "border-slate-200"}`}/>{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}
