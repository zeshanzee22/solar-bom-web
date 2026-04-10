import React, { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import {
  createUserApi,
  deleteUserApi,
  getAllUsersApi,
  updateUserApi,
  updateUserRoleApi,
} from "../../api/adminAuthApi";
import { assignUserPlanApi, getAllPlanApi } from "../../api/adminPlanApi";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // UserPage.jsx
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlanUser, setSelectedPlanUser] = useState(null);
  const [planOptions, setPlanOptions] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "customer",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    address: "",
    role: "customer",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await getAllUsersApi();
        if (data.status === "success") {
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await getAllPlanApi();
        if (data) setPlanOptions(data);
        console.log("plan data", data);
      } catch (err) {
        console.error("Error fetching plans:", err);
      }
    };
    fetchPlans();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createUserApi(formData);

      if (data.status === "success") {
        setUsers([...users, data.user]);
        setShowModal(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "customer",
        });
        alert("User Added Successfully!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateUserRole = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateUserRoleApi(
        selectedUser.id,
        editFormData.role,
      );

      if (data.success) {
        // Update local state
        setUsers(
          users.map((u) =>
            u.id === selectedUser.id ? { ...u, ...editFormData } : u,
          ),
        );
        setShowEditModal(false);
        alert("User Updated Successfully!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateUserApi(selectedUser.id, editFormData);

      if (data.success) {
        // Update local state with updated user info
        setUsers(
          users.map((u) =>
            u.id === selectedUser.id ? { ...u, ...editFormData } : u,
          ),
        );
        setShowEditModal(false);
        alert("User Updated Successfully!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete "${user.name}"?`))
      return;
    try {
      const { data } = await deleteUserApi(user.id);
      if (data.success) {
        setUsers(users.filter((u) => u.id !== user.id));
        alert("User Deleted Successfully!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleAssignPlanClick = (user) => {
    setSelectedPlanUser(user);
    setSelectedPlanId(user.plan_id || ""); // preselect current plan if any
    setShowPlanModal(true);
  };

  const handleAssignPlanSubmit = async () => {
    if (!selectedPlanId) return alert("Please select a plan");

    try {
      const { data } = await assignUserPlanApi({
        user_id: selectedPlanUser.id,
        plan_id: selectedPlanId,
      });

      if (data.success) {
        alert(data.message);
        // Update table locally
        const assignedPlan = planOptions.find((p) => p.id == selectedPlanId);
        setUsers(
          users.map((u) =>
            u.id === selectedPlanUser.id
              ? {
                  ...u,
                  plan_name: assignedPlan.name,
                  plan_id: assignedPlan.id,
                  plan_start_date: new Date().toISOString(),
                  plan_end_date: new Date(
                    Date.now() +
                      assignedPlan.duration_days * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                  plan_active: true,
                }
              : u,
          ),
        );
        setShowPlanModal(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to assign plan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Total Users: {users.length}
          </h2>
          <p className="text-gray-500 text-sm">
            Manage your team members and their account permissions here.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all"
        >
          <Plus size={18} /> Add user
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4 items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex-1 flex items-center gap-2 px-3 border-r border-gray-200">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="outline-none w-full text-sm"
          />
        </div>
        <button className="px-4 py-1 text-sm font-medium border rounded-md hover:bg-gray-50">
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-600">User name</th>
              <th className="p-4 font-medium text-gray-600">Role</th>
              <th className="p-4 font-medium text-gray-600">Email</th>
              <th className="p-4 font-medium text-gray-600">Plan</th>
              <th className="p-4 font-medium text-gray-600">Expiry</th>
              <th className="p-4 font-medium text-gray-600">Projects</th>
              <th className="p-4 font-medium text-gray-600 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-gray-900">{user.name}</div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 ${user.role === "admin" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"} rounded-full text-xs font-bold uppercase`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{user.email}</td>
                <td className="p-4 text-gray-500">
                  {user.plan_name || "No Plan"}
                </td>
                <td className="p-4 text-gray-500">
                  {user.plan_end_date
                    ? new Date(user.plan_end_date).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-4 text-gray-500">
                  {user.project_usage || "-"}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    {/* Assign Plan Button */}
                    <button
                      onClick={() => handleAssignPlanClick(user)}
                      className="p-1.5 rounded-full bg-purple-400 hover:bg-purple-200 transition-colors cursor-pointer"
                      title="Assign Plan"
                    >
                      Assign Plan
                    </button>
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit User"
                    >
                      <Pencil size={16} />
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete User"
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

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New User</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                required
                className="w-full p-2 border rounded-lg"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Email"
                required
                className="w-full p-2 border rounded-lg"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full p-2 border rounded-lg"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Address"
                required
                className="w-full p-2 border rounded-lg"
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <select
                className="w-full p-2 border rounded-lg"
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
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
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit User</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                required
                className="w-full p-2 border rounded-lg"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="email"
                required
                className="w-full p-2 border rounded-lg"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Address"
                required
                className="w-full p-2 border rounded-lg"
                value={editFormData.address}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
              />
              <select
                className="w-full p-2 border rounded-lg"
                value={editFormData.role}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, role: e.target.value })
                }
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              Assign Plan to {selectedPlanUser.name}
            </h3>

            <select
              className="w-full p-2 border rounded-lg mb-4"
              value={selectedPlanId || ""}
              onChange={(e) => setSelectedPlanId(e.target.value)}
            >
              <option value="">Select Plan</option>
              {planOptions.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.duration_days} days)
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPlanModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPlanSubmit}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                Assign Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
