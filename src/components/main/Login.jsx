import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { loginApi } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email  is required")
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^\d{10,15}$/.test(val),
      "Enter a valid email address",
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});


export default function Login() {
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // validate while typing
  });


  const onSubmit = async (data) => {
    try {
      setServerError(""); // clear old errors
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 10000),
      );

      const res = await Promise.race([
        loginApi({
          email: data.email,
          password: data.password,
        }),
        timeout,
      ]);

     
      // Save user and token in your store
      login(res.data.user, res.data.token);

      // Navigate based on role
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/"); // normal user
      }
    } catch (error) {
      console.log("Login failed", error);
      setServerError("Login failed. Please try again.");
    }
  };

  //for server error
  const [email, password] = watch(["email", "password"]);
  useEffect(() => {
    if (serverError) setServerError("");
  }, [email, password]);

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-white">
      <div
        className="bg-white p-10 m-4 rounded-2xl w-full max-w-md min-w-[320px]"
        style={{ border: "1px solid rgba(102,102,102,0.3)" }}
      >
        <h2 className="text-3xl font-medium text-center text-gray-700 mb-6">
          Sign in
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Email or mobile phone number
            </label>
            <input
              type="text"
              placeholder=""
              {...register("email")}
              className={`w-full text-gray-600 rounded-lg px-3 py-2 border 
                ${
                  errors.email
                    ? "border-red-700 focus:border-red-700"
                    : "border-[rgba(102,102,102,0.3)] focus:border-[rgba(102,102,102,0.8)]"
                } focus:outline-none focus:ring-0`}
            />
            {errors.email && (
              <p className="text-red-700 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            {/* Label + Eye */}
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-500 font-medium">
                Your password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center text-gray-500 text-xs focus:outline-none"
              >
                {showPassword ? (
                  <img src="/images/eyeoff.svg" className="w-4 h-4 mr-1" />
                ) : (
                  <img src="/images/eyeoff.svg" className="w-4 h-4 mr-1" />
                )}
                {showPassword ? "Hide" : "Show"}{" "}
              </button>
            </div>

            {/* Input */}
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`w-full text-gray-600 rounded-lg px-3 py-2 border 
                ${
                  errors.password
                    ? "border-red-700 focus:border-red-700"
                    : "border-[rgba(102,102,102,0.3)] focus:border-[rgba(102,102,102,0.8)]"
                } focus:outline-none focus:ring-0`}
            />
            {errors.password && (
              <p className="text-red-700 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* PRIVACY TEXT */}
          <p className="text-sm text-gray-600 mt-4 text-center">
            By continuing, you agree to the{" "}
            <a
              href="/terms"
              className="text-gray-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Use
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-gray-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            .
          </p>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full py-2 rounded-full transition flex items-center justify-center gap-2
              ${
                isValid
                  ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed text-white"
              }`}
          >
            {isSubmitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}

            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          {/* SERVER ERROR */}
          {serverError && (
            <div className=" text-red-700 text-sm mt-2 rounded-md">
              {serverError}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
