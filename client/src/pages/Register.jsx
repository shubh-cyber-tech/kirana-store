import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { api } from "../api/axios.js";
import { setCredentials } from "../store/authSlice.js";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      const { data } = await api.post("/auth/register", form);
      dispatch(setCredentials(data));
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-10">
      <form onSubmit={submit} className="panel w-full max-w-md p-6">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <div className="mt-6 space-y-4">
          <input className="field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="field" type="password" minLength={8} placeholder="Password (minimum 8 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="btn-primary w-full">Register</button>
        </div>
        <p className="mt-4 text-sm">Already registered? <Link className="text-leaf" to="/login">Login</Link></p>
      </form>
    </section>
  );
}
