import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Pencil, Trash2, X } from 'lucide-react';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', password: '', address: '', role: 'customer'
  });
  const [editFormData, setEditFormData] = useState({
    name: '', phone: '', address: '', role: 'customer'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('access_token');

      try {
        const response = await fetch('http://127.0.0.1:8000/api/get-users/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        const data = await response.json();
        if (data.status === 'success') {
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUsers([...users, data.user]);
        setShowModal(false);
        setFormData({ name: '', phone: '', password: '', address: '', role: 'customer' });
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
      phone: user.phone,
      address: user.address,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const roleRes = await fetch(`http://127.0.0.1:8000/api/update-role/${selectedUser.id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editFormData.role }),
      });
      const roleData = await roleRes.json();

      if (roleData.success) {
        // Update local state
        setUsers(users.map(u =>
          u.id === selectedUser.id ? { ...u, ...editFormData } : u
        ));
        setShowEditModal(false);
        alert("User Updated Successfully!");
      } else {
        alert(roleData.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete "${user.name}"?`)) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/delete-user/${user.id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== user.id));
        alert("User Deleted Successfully!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">All users {users.length}</h2>
          <p className="text-gray-500 text-sm">Manage your team members and their account permissions here.</p>
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
          <input type="text" placeholder="Search" className="outline-none w-full text-sm" />
        </div>
        <button className="px-4 py-1 text-sm font-medium border rounded-md hover:bg-gray-50">Filters</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-600">User name</th>
              <th className="p-4 font-medium text-gray-600">Access</th>
              <th className="p-4 font-medium text-gray-600">Phone</th>
              <th className="p-4 font-medium text-gray-600">Address</th>
              <th className="p-4 font-medium text-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-gray-900">{user.name}</div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{user.phone}</td>
                <td className="p-4 text-gray-500">{user.address}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
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
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input type="text" placeholder="Name" required className="w-full p-2 border rounded-lg"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input type="text" placeholder="Phone" required className="w-full p-2 border rounded-lg"
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <input type="password" placeholder="Password" required className="w-full p-2 border rounded-lg"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              <input type="text" placeholder="Address" required className="w-full p-2 border rounded-lg"
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              <select className="w-full p-2 border rounded-lg"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-lg">Save User</button>
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
              <button onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <input type="text" placeholder="Name" required className="w-full p-2 border rounded-lg"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
              <input type="text" placeholder="Phone" required className="w-full p-2 border rounded-lg"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} />
              <input type="text" placeholder="Address" required className="w-full p-2 border rounded-lg"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} />
              <select className="w-full p-2 border rounded-lg"
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-lg">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;