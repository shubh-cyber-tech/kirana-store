import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { api } from "../api/axios.js";
import { setCredentials } from "../store/authSlice.js";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const { data } = await api.post(
        "/auth/login",
        form,
        {
          withCredentials: true,
        }
      );

      /* SAVE TOKEN */
      localStorage.setItem(
        "token",
        data.token
      );

      /* SAVE USER */
      dispatch(setCredentials(data));

      toast.success("Login successful");

      /* REDIRECT */
      navigate(
        data.user.role === "admin"
          ? "/admin"
          : "/dashboard"
      );
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        (error.request
          ? "Cannot reach server. Please make sure the API is running on port 5000."
          : "Login failed");

      toast.error(
        message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-10">
      <form
        onSubmit={submit}
        className="panel w-full max-w-md p-6"
      >
        <h1 className="text-2xl font-bold">
          Login
        </h1>

        <div className="mt-6 space-y-4">
          <input
            className="field"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          />

          <input
            className="field"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            required
          />

          <button
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <Link
            className="text-leaf"
            to="/forgot-password"
          >
            Forgot password?
          </Link>

          <Link
            className="text-leaf"
            to="/register"
          >
            Create account
          </Link>
        </div>
      </form>
    </section>
  );
}
