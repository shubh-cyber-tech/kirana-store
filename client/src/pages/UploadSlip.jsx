import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/axios.js";

const blankAddress = { label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", phone: "" };
const blankItem = { name: "", quantity: "", unit: "kg", note: "" };
const units = ["kg", "g", "ltr", "ml", "pcs", "packet", "box"];

export default function UploadSlip() {
  const [mode, setMode] = useState("slip");
  const [file, setFile] = useState(null);
  const [manualItems, setManualItems] = useState([{ ...blankItem }]);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [address, setAddress] = useState(blankAddress);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    const cleanedItems = manualItems
      .map((item) => ({ ...item, name: item.name.trim(), quantity: Number(item.quantity) }))
      .filter((item) => item.name && item.quantity > 0);

    if (mode === "slip" && !file) return toast.error("Please upload a slip image or PDF");
    if (mode === "manual" && cleanedItems.length === 0) return toast.error("Please add at least one grocery item");

    const body = new FormData();
    if (file) body.append("slip", file);
    body.append("manualItems", JSON.stringify(mode === "manual" ? cleanedItems : []));
    body.append("notes", notes);
    body.append("paymentMethod", paymentMethod);
    body.append("address", JSON.stringify(address));
    setLoading(true);
    try {
      const { data } = await api.post("/orders", body);
      toast.success("Order placed");
      navigate(`/orders/${data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, key, value) => {
    setManualItems((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  };

  const addItem = () => setManualItems((items) => [...items, { ...blankItem }]);

  const removeItem = (index) => {
    setManualItems((items) => (items.length === 1 ? [{ ...blankItem }] : items.filter((_, itemIndex) => itemIndex !== index)));
  };

  return (
    <section className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Place Grocery Order</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Upload a handwritten list or type items manually with quantity and weight. The store team will review and upload the bill.</p>
      </div>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="panel p-6">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className={mode === "slip" ? "btn-primary" : "btn-secondary"} onClick={() => setMode("slip")}>Upload Slip</button>
            <button type="button" className={mode === "manual" ? "btn-primary" : "btn-secondary"} onClick={() => setMode("manual")}>Write Items</button>
          </div>

          {mode === "slip" ? (
            <label className="mt-5 grid min-h-56 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-green-200 bg-green-50 p-6 text-center dark:border-green-900 dark:bg-green-950">
              <UploadCloud className="mx-auto text-leaf" size={42} />
              <span className="mt-3 font-semibold">{file ? file.name : "Choose slip image or PDF"}</span>
              <span className="mt-1 text-sm text-slate-500">Max 8 MB</span>
              <input className="hidden" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFile(e.target.files?.[0])} />
            </label>
          ) : (
            <div className="mt-5 space-y-3">
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-900 dark:bg-green-950 dark:text-green-100">
                Example: Sugar 2 kg, Mustard oil 1 ltr, Maggi 4 pcs.
              </div>
              {manualItems.map((item, index) => (
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800" key={index}>
                  <div className="grid gap-2 sm:grid-cols-[1fr_0.42fr_0.45fr_auto]">
                    <input className="field" placeholder="Item name" value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} />
                    <input className="field" min="0" step="0.01" type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} />
                    <select className="field" value={item.unit} onChange={(e) => updateItem(index, "unit", e.target.value)}>
                      {units.map((unit) => <option key={unit}>{unit}</option>)}
                    </select>
                    <button type="button" className="btn-secondary px-3" onClick={() => removeItem(index)} aria-label="Remove item">
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <input className="field mt-2" placeholder="Optional item note, brand, size, etc." value={item.note} onChange={(e) => updateItem(index, "note", e.target.value)} />
                </div>
              ))}
              <button type="button" className="btn-secondary w-full" onClick={addItem}>
                <Plus size={18} /> Add Another Item
              </button>
            </div>
          )}
          <textarea className="field mt-5 min-h-32" placeholder="Optional notes or brand preferences" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="panel p-6">
          <h2 className="text-xl font-bold">Delivery & Payment</h2>
          <div className="mt-5 grid gap-3">
            {Object.keys(blankAddress).map((key) => (
              <input
                key={key}
                className="field"
                placeholder={key === "line1" ? "Address line 1" : key.charAt(0).toUpperCase() + key.slice(1)}
                value={address[key]}
                onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                required={["line1", "city", "state", "pincode", "phone"].includes(key)}
              />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["online", "Online Payment"],
              ["cod", "Cash on Delivery"]
            ].map(([value, label]) => (
              <button type="button" className={paymentMethod === value ? "btn-primary" : "btn-secondary"} key={value} onClick={() => setPaymentMethod(value)}>
                {label}
              </button>
            ))}
          </div>
          <button className="btn-primary mt-6 w-full" disabled={loading}>{loading ? "Placing order..." : "Place Order"}</button>
        </div>
      </form>
    </section>
  );
}
