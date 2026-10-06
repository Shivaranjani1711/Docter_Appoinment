import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { ApiError } from "../../api/client";
import { Alert } from "../../components/Alert";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const user = await login(values.email, values.password);
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "ACCOUNT_LOCKED") {
        setServerError("Too many failed attempts. Please try again in a few minutes.");
      } else {
        setServerError("Incorrect email or password.");
      }
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-semibold text-ink-900">Log in</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {notice && <Alert kind="success">{notice}</Alert>}
        {serverError && <Alert kind="error">{serverError}</Alert>}
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" className="input" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-600">
        <Link to="/forgot-password" className="text-brand-700 hover:underline">
          Forgot your password?
        </Link>
      </p>
      <p className="mt-2 text-sm text-ink-600">
        Don't have an account?{" "}
        <Link to="/register" className="text-brand-700 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
