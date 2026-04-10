import apiClient from "./apiClient";

// Create Invoice (Admin only)
export const createInvoiceApi = (data) => {
  return apiClient.post("/invoices/", data);
};

// Get all invoices (Admin gets all, user gets own)
export const getAllInvoiceApi = () => {
  return apiClient.get("/invoices/");
};

// Delete invoice
export const deleteInvoiceApi = (id) => {
  return apiClient.delete(`/invoices/${id}/`);
};

// Update invoice
export const updateInvoiceApi = (id, data) => {
  return apiClient.put(`/invoices/${id}/`, data);
};

export const updateInvoiceStatusApi = (invoiceId, status) => {
  return apiClient.patch(`/invoices/${invoiceId}/update-status/`, {
    status,
  });
};