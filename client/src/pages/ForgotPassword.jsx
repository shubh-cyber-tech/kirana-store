import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/axios.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const { data } = await api.post("/auth/forgot-password", { email });
    toast.success(data.message);
  };

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-10">
      <form onSubmit={submit} className="panel w-full max-w-md p-6">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <input className="field mt-6" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn-primary mt-4 w-full">Send reset link</button>
      </form>
    </section>
  );
}
