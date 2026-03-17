import React from "react";

const plans = [
  {
    tool: "T1 (BOM & 2D Drawing)",
    plans: [
      {
        name: "Base",
        server: "1",
        credits: "10 credits / month",
        price: "$19",
      },
      {
        name: "Premium",
        server: "1",
        credits: "100 credits / month",
        price: "$19",
      },
    ],
  },
  {
    tool: "T2 (Solar Layout Design)",
    plans: [
      {
        name: "Base",
        server: "1",
        credits: "10 credits / month",
        price: "$19",
      },
      {
        name: "Premium",
        server: "1",
        credits: "100 credits / month",
        price: "$19",
      },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="bg-gray-50 py-16 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Plans & Pricing</h1>
        <p className="text-gray-600 mb-12">
          Choose the plan that fits your engineering workflow
        </p>

        {/* Tool Plans */}
        {plans.map((tool, index) => (
          <div key={index} className="mb-16">
            <h2 className="text-2xl font-semibold mb-8">{tool.tool}</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {tool.plans.map((plan, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-md p-8 border hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>

                  <div className="text-4xl font-bold mb-6">
                    {plan.price}
                    <span className="text-sm text-gray-500"> / month</span>
                  </div>

                  <ul className="text-gray-600 space-y-3 mb-6">
                    <li>✔ Server: {plan.server}</li>
                    <li>✔ Usage: {plan.credits}</li>
                    <li>✔ Tool Access</li>
                  </ul>

                  <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800">
                    Contact Admin
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Enterprise */}
        <div className="bg-black text-white rounded-2xl p-12 mt-12">
          <h2 className="text-3xl font-bold mb-4">Enterprise / Bundle</h2>

          <p className="mb-6 text-gray-300">
            Access both tools (t1 + t2) with multi-server support and unlimited
            usage.
          </p>

          <div className="text-4xl font-bold mb-6">Custom Pricing</div>

          <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
