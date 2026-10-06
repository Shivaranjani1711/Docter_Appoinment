import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { ApiError } from "../../api/client";
import { Alert } from "../../components/Alert";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  password: z
    .string()
    .min(10, "At least 10 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[0-9]/, "Must include a number"),
  role: z.enum(["PATIENT", "DOCTOR"]),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms and Privacy Policy" }) }),
});
type FormValues = z.infer<typeof schema>;

export function Register() {
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: "PATIENT" } });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const user = await doRegister(values);
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_IN_USE") {
        setServerError("An account with this email already exists.");
      } else {
        setServerError("We couldn't create your account. Please check the form and try again.");
      }
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-semibold text-ink-900">Create your account</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <Alert kind="error">{serverError}</Alert>}

        <div>
          <span className="label">I am a</span>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" value="PATIENT" {...register("role")} /> Patient
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="DOCTOR" {...register("role")} /> Doctor
            </label>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input id="fullName" className="input" {...register("fullName")} aria-invalid={!!errors.fullName} />
          {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" className="input" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="phone">
            Phone <span className="font-normal text-ink-400">(optional)</span>
          </label>
          <input id="phone" className="input" {...register("phone")} />
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

        <div>
          <label className="flex items-start gap-2 text-sm text-ink-700">
            <input type="checkbox" className="mt-1" {...register("acceptedTerms")} />
            <span>
              I agree to the{" "}
              <Link to="/terms-and-conditions" className="text-brand-700 hover:underline" target="_blank">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="text-brand-700 hover:underline" target="_blank">
                Privacy Policy
              </Link>
              , including how my medical information is collected and used.
            </span>
          </label>
          {errors.acceptedTerms && <p className="field-error">{errors.acceptedTerms.message}</p>}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-600">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
