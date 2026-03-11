import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { loginApi } from "../../api/ authApi";

export default function Login() {
  const login = useAuthStore((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginApi({
        phone: email,
        password: password,
      });

      login(res.data.user, res.data.token);
    } catch (error) {
      console.log("Login failed", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-white">
      <div
        className="bg-white p-10 m-4 rounded-2xl w-full max-w-md min-w-[320px]"
        style={{ border: "1px solid rgba(102,102,102,0.3)" }}
      >
        <h2 className="text-3xl font-medium text-center text-gray-700 mb-6">
          Sign in
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}

          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Email or mobile phone number
            </label>
            <input
              type="text"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-gray-600 rounded-lg px-3 py-2 border border-[rgba(102,102,102,0.3)] 
             focus:outline-none focus:border-[rgba(102,102,102,0.8)] focus:ring-0"
            />
          </div>

          {/* Password */}

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
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-600 rounded-lg px-3 py-2 border border-[rgba(102,102,102,0.3)] 
                   focus:outline-none focus:border-[rgba(102,102,102,0.8)] focus:ring-0"
            />
          </div>

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

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-gray-400 text-white py-2 rounded-full hover:bg-green-700 transition cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
