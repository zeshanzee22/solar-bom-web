import React, { useState } from "react";

const pricingData = {
  t1: [
    {
      name: "Starter",
      price: "Rs 1500",
      features: [
        "5 Projects / month",
        "20 Structural 2D Views",
        "WhatsApp Support",
        "PDF / XLSX Export",
      ],
    },
    {
      name: "Business",
      price: "Rs 6000",
      features: [
        "Unlimited Projects",
        "Unlimited 2D Views",
        "Priority WhatsApp Support",
        "PDF / XLSX Export",
      ],
    },
  ],
  t2: [
    {
      name: "Starter",
      price: "Rs 1800",
      features: [
        "5 Projects / month",
        "Basic Layout Designs",
        "Walkway Placement",
        "WhatsApp Support",
      ],
    },
    {
      name: "Business",
      price: "Rs 6500",
      features: [
        "Unlimited Projects",
        "Advanced Layout Designs",
        "Walkway Placement",
        "Priority Support",
      ],
    },
  ],
  bundle: [
    {
      name: "Starter",
      price: "Rs 2500",
      features: [
        "10 Projects / month",
        "20 Structural 2D Views",
        "Basic Layout Designs",
        "Walkway Placement",
        "WhatsApp Support",
        "PDF / XLSX Export",
      ],
    },
    {
      name: "Business",
      price: "Rs 9000",
      features: [
        "Unlimited Projects",
        "Unlimited 2D Views",
        "Advanced Layout Designs",
        "Walkway Placement",
        "Priority WhatsApp Support",
        "PDF / XLSX Export",
      ],
    },
  ],
};

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState("t1");

  const tabs = [
    { key: "t1", label: "BOM + 2D Drawing" },
    { key: "t2", label: "Layout Designer" },
    { key: "bundle", label: "Pro Bundle (Save Rs 2000)" },
  ];

  return (
    <div className="bg-gray-50 py-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-3">Plans & Pricing</h1>
        <p className="text-gray-500 mb-12">
          Select the tool that powers your solar business
        </p>

        {/* Tabs */}
        <div className="flex justify-center mb-12 px-2">
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm rounded-md border transition ${
                  activeTab === tab.key
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="flex justify-center gap-8 flex-wrap">
          {pricingData[activeTab].map((plan, index) => (
            <div
              key={index}
              className="w-full sm:w-[320px] bg-white rounded-2xl shadow-md p-8 border hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>

              <div className="text-4xl font-bold mb-5">
                {plan.price}
                <span className="text-sm text-gray-500"> / month</span>
              </div>

              <ul className="text-gray-600 space-y-3 mb-6 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✔</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition">
                Contact Sales
              </button>
            </div>
          ))}
        </div>

        {/* Bundle Extra Info */}
        {activeTab === "bundle" && (
          <div className="mt-12 text-green-600 font-semibold text-lg">
            🎉 Save Rs 2000 with Pro Bundle
          </div>
        )}
      </div>
    </div>
  );
}
