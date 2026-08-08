import { useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend endpoint yet — this is a placeholder confirmation.
    // Wire to a real /contact endpoint (or an email service) when ready.
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl sm:text-4xl font-bold text-slate-800">
          Contact Us
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500">
          We'd love to hear from you.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <Phone className="text-blue-600" size={20} />
              <span className="text-sm">+91 90000 00000</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <Mail className="text-blue-600" size={20} />
              <span className="text-sm">support@babjitransports.com</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <MapPin className="text-blue-600" size={20} />
              <span className="text-sm">Indore, Madhya Pradesh</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
            {sent ? (
              <p className="text-center text-green-600">
                Thanks — we'll get back to you soon!
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  required
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder="Your Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
                <textarea
                  required
                  rows={4}
                  placeholder="Message"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
                <button className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
