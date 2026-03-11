import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 md:px-12">
      <div className="flex flex-col-reverse md:flex-row items-center md:items-start w-full max-w-6xl gap-8">
        {/* Left Side - Text */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-green-700 font-medium mb-2 uppercase text-sm">
            Welcome to Solar Struckra
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Your Next <br /> Big Module
          </h1>
          <p className="text-gray-700 mb-6 ">
            Explore our tools and modules to improve productivity, manage tasks
            efficiently, improve productivity, manage tasks efficiently, improve
            productivity, manage tasks efficiently,and stay ahead with smart
            solutions.
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-600 transition w-fit"
          >
            Get In Touch
          </button>
        </div>

        {/* Right Side - Image */}
        <div className="flex-1 flex justify-center md:justify-end">
          <img
            src="/images/solar.png" // <-- use public folder image
            alt="Hero Illustration"
            className="w-full max-w-sm md:max-w-md object-contain"
          />
        </div>
      </div>
    </div>
  );
}
