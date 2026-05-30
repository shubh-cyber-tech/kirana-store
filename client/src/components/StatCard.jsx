export default function StatCard({ label, value, accent = "bg-green-100 text-green-800" }) {
  return (
    <div className="panel p-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <span className={`mt-4 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${accent}`}>Live</span>
    </div>
  );
}
