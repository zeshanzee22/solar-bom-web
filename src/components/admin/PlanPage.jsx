// src/Pages/Admin/PlanPage.jsx


import React, { useEffect, useState } from "react";
import { Pencil, Trash2, X, Plus } from "lucide-react";
import {
  createPlanApi,
  deletePlanApi,
  getAllPlanApi,
  updatePlanApi,
} from "../../api/adminPlanApi";

const TOOL_NAMES = {
  t1: "BOM + 2D Drawing",
  t2: "Layout Designer",
  hybrid: "Hybrid (T1 + T2)",
};

const PlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    tool: "t1",
    t1_projects_limit: 0,
    t2_projects_limit: 0,
    is_unlimited: false,
    duration_days: 30,
    price: 0,
  });

  // Fetch all plans
  const fetchPlans = async () => {
    try {
      const { data } = await getAllPlanApi();
      setPlans(data);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEditClick = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      tool: plan.tool,
      t1_projects_limit: plan.t1_projects_limit || 0,
      t2_projects_limit: plan.t2_projects_limit || 0,
      is_unlimited: plan.is_unlimited,
      duration_days: plan.duration_days,
      price: plan.price || 0,
    });
    setShowModal(true);
  };

  const handleAddClick = () => {
    setSelectedPlan(null);
    setFormData({
      name: "",
      tool: "t1",
      t1_projects_limit: 0,
      t2_projects_limit: 0,
      is_unlimited: false,
      duration_days: 30,
      price: 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      if (payload.tool === "t1") delete payload.t2_projects_limit;
      if (payload.tool === "t2") delete payload.t1_projects_limit;

      if (selectedPlan) {
        await updatePlanApi(selectedPlan.id, payload);
        setPlans(plans.map((p) => (p.id === selectedPlan.id ? { ...p, ...payload } : p)));
        alert("Plan updated successfully!");
      } else {
        const { data } = await createPlanApi(payload);
        setPlans([...plans, data]);
        alert("Plan created successfully!");
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error saving plan:", err);
      alert("Failed to save plan");
    }
  };

  const handleDeletePlan = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.name}"?`)) return;
    try {
      await deletePlanApi(plan.id);
      setPlans(plans.filter((p) => p.id !== plan.id));
      alert("Plan deleted successfully!");
    } catch (err) {
      console.error("Error deleting plan:", err);
      alert("Failed to delete plan");
    }
  };

  if (loading) return <div>Loading plans...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Plans</h2>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} /> Add New Plan
        </button>
      </div>

      {/* Plans Table */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-600">Plan Name</th>
              <th className="p-4 font-medium text-gray-600">Tool</th>
              <th className="p-4 font-medium text-gray-600">Price</th>
              <th className="p-4 font-medium text-gray-600">T1 Limit</th>
              <th className="p-4 font-medium text-gray-600">T2 Limit</th>
              <th className="p-4 font-medium text-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">{plan.name}</td>
                <td className="p-4">{TOOL_NAMES[plan.tool]}</td>
                <td className="p-4">{plan.price || 0}</td>
                <td className="p-4">{plan.is_unlimited ? "∞" : plan.t1_projects_limit || "—"}</td>
                <td className="p-4">{plan.is_unlimited ? "∞" : plan.t2_projects_limit || "—"}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(plan)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Plan"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedPlan ? "Edit Plan" : "Add New Plan"}</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Plan Name */}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Plan Name</label>
                <input
                  type="text"
                  placeholder="Plan Name"
                  required
                  className="w-full p-2 border rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Tool */}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Tool</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={formData.tool}
                  onChange={(e) =>
                    setFormData({ ...formData, tool: e.target.value })
                  }
                >
                  <option value="t1">BOM + 2D Drawing</option>
                  <option value="t2">Layout Designer</option>
                  <option value="hybrid">Hybrid (T1 + T2)</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Price</label>
                <input
                  type="number"
                  placeholder="Price"
                  className="w-full p-2 border rounded-lg"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  min={0}
                  step={0.01}
                />
              </div>

              {/* T1 Limit */}
              {(formData.tool === "t1" || formData.tool === "hybrid") && (
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">T1 Projects Limit</label>
                  <input
                    type="number"
                    placeholder="T1 Projects Limit"
                    className="w-full p-2 border rounded-lg"
                    value={formData.t1_projects_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, t1_projects_limit: parseInt(e.target.value) || 0 })
                    }
                    disabled={formData.is_unlimited}
                  />
                </div>
              )}

              {/* T2 Limit */}
              {(formData.tool === "t2" || formData.tool === "hybrid") && (
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">T2 Projects Limit</label>
                  <input
                    type="number"
                    placeholder="T2 Projects Limit"
                    className="w-full p-2 border rounded-lg"
                    value={formData.t2_projects_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, t2_projects_limit: parseInt(e.target.value) || 0 })
                    }
                    disabled={formData.is_unlimited}
                  />
                </div>
              )}

              {/* Unlimited */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_unlimited}
                  onChange={(e) =>
                    setFormData({ ...formData, is_unlimited: e.target.checked })
                  }
                />
                <label className="text-sm text-gray-500">Unlimited Projects</label>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Duration (days)</label>
                <input
                  type="number"
                  placeholder="Duration (days)"
                  className="w-full p-2 border rounded-lg"
                  value={formData.duration_days}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_days: parseInt(e.target.value) })
                  }
                  min={1}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg"
                >
                  {selectedPlan ? "Update Plan" : "Add Plan"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanPage;