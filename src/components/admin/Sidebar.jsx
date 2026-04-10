import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Home, Receipt, Users } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 text-xl font-bold text-blue-600 border-b">Solar</div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/admin" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg">
          <Home size={20} /> <span className="font-medium">Home</span>
        </Link>
        <Link to="/admin/users" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg">
          <Users size={20} /> <span className="font-medium">Users</span>
        </Link>
         <Link to="/admin/plans" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg">
          <CreditCard size={20} /> <span className="font-medium">Plans</span>
        </Link>
         <Link to="/admin/invoices" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 rounded-lg">
           <Receipt size={20} /> <span className="font-medium">Invoices</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;