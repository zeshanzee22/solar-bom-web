import React, { useEffect, useState } from "react";
import { Pencil, Trash2, X, Plus } from "lucide-react";
import {
  createInvoiceApi,
  deleteInvoiceApi,
  getAllInvoiceApi,
  updateInvoiceApi,
  updateInvoiceStatusApi,
} from "../../api/adminInvoiceApi";
import { getAllPlanApi } from "../../api/adminPlanApi";
import { getAllUsersApi } from "../../api/adminAuthApi";

const STATUS_OPTIONS = ["all", "pending", "paid", "cancelled", "expired"];

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  paid: "bg-green-100 text-green-700 border-green-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
  expired: "bg-gray-100 text-gray-600 border-gray-300",
  all: "bg-gray-200 text-gray-800 border-gray-300",
};

const InvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [formData, setFormData] = useState({
    customer: "",
    plan: "",
    status: "pending",
    due_date: "",
    notes: "",
  });

  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // <-- filter state

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    try {
      const [invoiceRes, planRes, userRes] = await Promise.all([
        getAllInvoiceApi(),
        getAllPlanApi(),
        getAllUsersApi(),
      ]);

      setInvoices(invoiceRes.data);
      setPlans(planRes.data);
      setUsers(userRes.data.users);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // STATUS CHANGE
  // =========================
  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      setUpdatingId(invoiceId);

      // Optimistic UI update
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId ? { ...inv, status: newStatus } : inv,
        ),
      );

      const { data } = await updateInvoiceStatusApi(invoiceId, newStatus);

      // Sync with backend response
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? data.data : inv)),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
      fetchData();
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // MODAL HANDLERS
  // =========================
  const handleAddClick = () => {
    setSelectedInvoice(null);
    setFormData({
      customer: "",
      plan: "",
      status: "pending",
      due_date: "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleEditClick = (inv) => {
    setSelectedInvoice(inv);
    setFormData({
      customer: inv.customer,
      plan: inv.plan,
      status: inv.status,
      due_date: inv.due_date?.slice(0, 16) || "",
      notes: inv.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedInvoice) {
        await updateInvoiceApi(selectedInvoice.id, formData);

        setInvoices(
          invoices.map((i) =>
            i.id === selectedInvoice.id ? { ...i, ...formData } : i,
          ),
        );

        alert("Invoice updated!");
      } else {
        const { data } = await createInvoiceApi(formData);
        setInvoices([data, ...invoices]);
        alert("Invoice created!");
      }

      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Error saving invoice");
    }
  };

  const handleDelete = async (inv) => {
    if (!window.confirm("Delete this invoice?")) return;

    try {
      await deleteInvoiceApi(inv.id);
      setInvoices(invoices.filter((i) => i.id !== inv.id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  // =========================
  // FILTERED INVOICES
  // =========================
  const filteredInvoices =
    statusFilter === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === statusFilter);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Manage Invoices</h2>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          <Plus size={16} /> Add Invoice
        </button>
      </div>

      {/* STATUS FILTER CHIPS */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded-full border text-sm font-semibold transition-all
            ${
              statusFilter === status
                ? "bg-black text-white border-black"
                : STATUS_STYLES[status]
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-center">
            <tr>
              <th className="p-3">Invoice #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Month</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody className="text-center">
            {filteredInvoices &&
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="border-t">
                  <td className="p-3">{inv.invoice_number}</td>
                  <td className="p-3">{inv.customer_email}</td>
                  <td className="p-3">{inv.plan_name}</td>
                  <td className="p-3 text-center">
                    {new Date(inv.created_at).toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-3">{inv.amount}</td>

                  <td className="p-3">
                    <select
                      value={inv.status}
                      disabled={updatingId === inv.id}
                      onChange={(e) =>
                        handleStatusChange(inv.id, e.target.value)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold border outline-none cursor-pointer transition-all
      ${STATUS_STYLES[inv.status]}
      ${updatingId === inv.id ? "opacity-50 cursor-not-allowed" : ""}
    `}
                    >
                      <option value="pending"> Pending</option>
                      <option value="paid"> Paid</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="expired"> Expired</option>
                    </select>
                  </td>

                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleEditClick(inv)}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(inv)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold">
                {selectedInvoice ? "Edit Invoice" : "Add Invoice"}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer */}
              <div>
                <label className="text-sm text-gray-500">Customer</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formData.customer}
                  onChange={(e) =>
                    setFormData({ ...formData, customer: e.target.value })
                  }
                  required
                >
                  <option value="">Select user</option>
                  {users &&
                    users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email}
                      </option>
                    ))}
                </select>
              </div>

              {/* Plan */}
              <div>
                <label className="text-sm text-gray-500">Plan</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formData.plan}
                  onChange={(e) =>
                    setFormData({ ...formData, plan: e.target.value })
                  }
                >
                  <option value="">Select plan</option>
                  {plans &&
                    plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price})
                      </option>
                    ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-sm text-gray-500">Due Date</label>
                <input
                  type="datetime-local"
                  className="w-full border p-2 rounded"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm text-gray-500">Notes</label>
                <textarea
                  className="w-full border p-2 rounded"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border p-2 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-black text-white p-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;