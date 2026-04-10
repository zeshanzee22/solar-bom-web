import React from "react";

const LimitReachedDialog = ({ open, onClose, onUpgrade, onContact }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-2xl">
            ⚠️
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-semibold text-gray-800 mb-2">
          Project Limit Reached
        </h2>

        {/* Description */}
        <p className="text-center text-sm text-gray-500 mb-6">
          You have reached your project limit for this plan.
          Upgrade your plan or contact support to continue using this feature.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          
          {/* Upgrade */}
          <button
            onClick={onUpgrade}
            className="w-full py-2 rounded-lg bg-green-700 text-white font-medium hover:bg-green-600 transition"
          >
            Upgrade Plan
          </button>

          {/* Contact */}
          <button
            onClick={onContact}
            className="w-full py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
          >
            Contact Admin
          </button>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimitReachedDialog;