import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgePercent,
  Banknote,
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  UploadCloud,
  Wallet
} from "lucide-react";

const categories = [
  ["Atta & Rice", "Basmati, wheat flour, poha"],
  ["Pulses", "Dal, chana, rajma, lobia"],
  ["Oil & Ghee", "Mustard oil, refined oil, ghee"],
  ["Spices", "Masala, haldi, mirch, jeera"],
  ["Snacks", "Namkeen, biscuits, chips"],
  ["Personal Care", "Soap, shampoo, hygiene"]
];

const steps = [
  { icon: UploadCloud, title: "Upload or Write", text: "Send a photo/PDF or type items with quantity and weight." },
  { icon: FileText, title: "Bill Prepared", text: "Admin checks availability, prepares the invoice, and uploads it." },
  { icon: Wallet, title: "Pay or COD", text: "Pay online by UPI/card/net banking or choose cash on delivery." },
  { icon: Truck, title: "Track Delivery", text: "Follow each order stage from packing to doorstep delivery." }
];

const offers = ["Best monthly ration pricing", "Same-day local delivery", "Digital invoice download", "Order chat with store"];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_50%,#fff7ed_100%)] py-12 dark:bg-none md:py-16">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-leaf via-saffron to-leaf" />
        <div className="container-page grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-sm font-bold text-orange-700 shadow-sm dark:border-orange-900 dark:bg-slate-950">
              <Sparkles size={16} /> Trusted kirana in Bewar
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-green-950 dark:text-green-100 md:text-6xl">
              Shambhoo Dayal and Sons
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-700 dark:text-slate-300">
              Order groceries the simple way. Upload your handwritten list or type items with quantity and weight, get a verified bill, pay online or choose COD, and track delivery from the store to your home.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/upload-slip">Order by Slip or Text <ArrowRight size={18} /></Link>
              <Link className="btn-secondary" to="/orders">Track Orders</Link>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["500+", "Daily essentials"],
                ["9 stages", "Live order tracking"],
                ["2 ways", "Online payment or COD"]
              ].map(([value, label]) => (
                <div className="rounded-lg border border-green-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950" key={label}>
                  <p className="text-2xl font-black text-green-800 dark:text-green-200">{value}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-lg bg-green-950 p-6 text-white shadow-soft">
            <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(21,128,61,0.9),rgba(20,83,45,0.75)),url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
            <div className="relative grid h-full content-between gap-8">
              <div>
                <p className="text-sm uppercase tracking-wide text-green-100">Smart grocery ordering</p>
                <h2 className="mt-3 max-w-lg text-3xl font-bold">No product searching. Just upload your list and relax.</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {offers.map((item) => (
                  <div className="rounded-lg bg-white/14 p-4 backdrop-blur" key={item}>
                    <CheckCircle2 className="mb-2 text-orange-200" size={20} />
                    <p className="font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: BadgePercent, title: "Fair Pricing", text: "Clear invoices before payment" },
            { icon: ShieldCheck, title: "Trusted Billing", text: "Admin-reviewed grocery slips" },
            { icon: MessageCircle, title: "Order Chat", text: "Talk to store about replacements" },
            { icon: Truck, title: "Delivery Updates", text: "Track dispatch and delivery" }
          ].map(({ icon: Icon, title, text }) => (
            <div className="panel p-5 transition hover:-translate-y-1 hover:border-green-300 hover:shadow-soft" key={title}>
              <Icon className="text-saffron" />
              <p className="mt-3 font-semibold">{title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12 dark:bg-slate-950">
        <div className="container-page">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold">How Your Order Works</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Built for customers who prefer quick handwritten lists instead of browsing hundreds of products.</p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <div className="relative rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900" key={title}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-leaf text-white"><Icon size={21} /></span>
                  <span className="text-sm font-black text-orange-500">0{index + 1}</span>
                </div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 dark:bg-slate-950">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Popular Categories</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Everything your home needs, handled by your local store team.</p>
            </div>
            <Clock className="hidden text-leaf md:block" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {categories.map(([category, text]) => (
              <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-green-950 transition hover:border-orange-200 hover:bg-orange-50 dark:border-green-900 dark:bg-green-950 dark:text-green-100" key={category}>
                <p className="font-semibold">{category}</p>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel p-6">
          <h2 className="text-2xl font-bold">About the Store</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Shambhoo Dayal and Sons combines trusted neighborhood service with a modern order workflow. Customers keep their familiar handwritten lists while the store handles billing, delivery updates, and communication digitally.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { icon: Banknote, title: "COD Available", text: "Pay when the order arrives" },
              { icon: Wallet, title: "Online Payments", text: "UPI, cards, wallet, banking" },
              { icon: Headphones, title: "Support", text: "Chat on every order" },
              { icon: ShieldCheck, title: "Secure Login", text: "JWT protected accounts" }
            ].map(({ icon: Icon, title, text }) => (
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900" key={title}>
                <Icon className="text-leaf" size={20} />
                <p className="mt-2 font-semibold">{title}</p>
                <p className="text-sm text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="contact" className="rounded-lg bg-green-950 p-6 text-white shadow-soft">
          <h2 className="text-2xl font-bold">Visit or Contact Us</h2>
          <p className="mt-3 text-green-100">For order help, invoice questions, delivery updates, or product availability.</p>
          <div className="mt-6 grid gap-4">
            <a className="flex items-start gap-3 rounded-lg bg-white/10 p-4 transition hover:bg-white/15" href="tel:+919719165106">
              <Phone className="mt-1 text-orange-200" size={20} />
              <span><span className="block text-sm text-green-100">Phone</span><span className="font-semibold">+91 9719165106</span></span>
            </a>
            <a className="flex items-start gap-3 rounded-lg bg-white/10 p-4 transition hover:bg-white/15" href="mailto:bhardwajshubhankit@gmail.com">
              <Mail className="mt-1 text-orange-200" size={20} />
              <span><span className="block text-sm text-green-100">Email</span><span className="font-semibold">bhardwajshubhankit@gmail.com</span></span>
            </a>
            <div className="flex items-start gap-3 rounded-lg bg-white/10 p-4">
              <MapPin className="mt-1 text-orange-200" size={20} />
              <span><span className="block text-sm text-green-100">Address</span><span className="font-semibold">Sadar Chauraha, Bewar, Mainpuri, UP 205301</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-orange-50 py-12 dark:bg-slate-900">
        <div className="container-page grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-bold">Customer Convenience Features</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Important tools are already built into the application for daily grocery operations.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Upload a slip or write grocery items manually",
              "Visual timeline for each order stage",
              "Invoice PDF view and download",
              "Real-time admin-customer chat",
              "Payment success and failure handling",
              "Admin dashboard with revenue analytics"
            ].map((feature) => (
              <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-slate-950" key={feature}>
                <CheckCircle2 className="shrink-0 text-leaf" size={20} />
                <p className="text-sm font-semibold">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Very useful for monthly ration lists. I can upload one photo and wait for the bill.", "Customer"],
            ["The order status timeline makes delivery updates clear.", "Local family"],
            ["Invoice download and COD option are convenient for home orders.", "Regular buyer"]
          ].map(([quote, name]) => (
            <div className="panel p-5" key={quote}>
              <p className="text-slate-700 dark:text-slate-300">&quot;{quote}&quot;</p>
              <p className="mt-4 text-sm font-bold text-green-800 dark:text-green-200">{name}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
