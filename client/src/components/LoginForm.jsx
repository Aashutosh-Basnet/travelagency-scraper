import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "../schemas/auth.schema";
import { useAuth } from "../context/AuthContext";

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const values = Object.fromEntries(new FormData(e.currentTarget).entries());
    const result = loginSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await login({
        email: values.email,
        password: values.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Invalid credentials or server error."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#f8f5ef] px-4 py-12 text-[#181716] flex items-center justify-center">
      <div className="w-full max-w-[480px] rounded-[28px] border border-black/10 bg-white p-8 md:p-10 shadow-[0_20px_60px_rgba(17,17,17,0.06)]">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600">
          Welcome Back
        </span>
        <h1 className="m-0 font-serif text-3xl font-bold tracking-tight md:text-4xl">
          Sign in to read & write.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          Access your personal feed, write articles, and connect with other authors.
        </p>

        {serverError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {serverError}
          </div>
        )}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-xs font-bold uppercase text-neutral-700">
              Email Address
            </label>
            <input
              className="rounded-xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
            />
            {errors.email && <p className="m-0 text-xs font-medium text-red-600">{errors.email}</p>}
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-xs font-bold uppercase text-neutral-700">
              Password
            </label>
            <input
              className="rounded-xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
            />
            {errors.password && <p className="m-0 text-xs font-medium text-red-600">{errors.password}</p>}
          </div>

          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/register" className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-900">
              Need an account? Sign up
            </Link>
            <button
              disabled={loading}
              className="w-full sm:w-auto rounded-full bg-[#181716] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
              type="submit"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default LoginForm;