import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { api } from "../api/axios.js";
import { setCredentials } from "../store/authSlice.js";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      dispatch(setCredentials(data));
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    }
  };

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-10">
      <form onSubmit={submit} className="panel w-full max-w-md p-6">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <input className="field mt-6" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn-primary mt-4 w-full">Update password</button>
      </form>
    </section>
  );
}
