
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminPanel from './AdminPanel';

type AdminPage = 'dashboard' | 'panel';

const Navbar: React.FC<{ onLogout: () => void, activePage: AdminPage, setActivePage: (page: AdminPage) => void }> = ({ onLogout, activePage, setActivePage }) => {
  const NavLink: React.FC<{ page: AdminPage, children: React.ReactNode }> = ({ page, children }) => (
    <button
      onClick={() => setActivePage(page)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
        activePage === page ? 'bg-pink-500 text-white' : 'text-gray-200 hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800/50 backdrop-blur-sm shadow-lg z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 text-2xl font-bold text-pink-400">Voting Portal</div>
          <div className="hidden md:flex items-center space-x-4">
            <NavLink page="dashboard">Dashboard</NavLink>
            <NavLink page="panel">Admin Panel</NavLink>
          </div>
          <button
            onClick={onLogout}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 text-sm rounded-full transition-all duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');

  return (
    <div className="min-h-screen">
      <Navbar onLogout={logout} activePage={activePage} setActivePage={setActivePage} />
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        {activePage === 'dashboard' && <AdminDashboard />}
        {activePage === 'panel' && <AdminPanel />}
      </main>
       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm p-2 flex justify-around">
          <button onClick={() => setActivePage('dashboard')} className={`p-2 rounded-md ${activePage === 'dashboard' ? 'text-pink-400' : 'text-gray-300'}`}>Dashboard</button>
          <button onClick={() => setActivePage('panel')} className={`p-2 rounded-md ${activePage === 'panel' ? 'text-pink-400' : 'text-gray-300'}`}>Admin Panel</button>
      </div>
    </div>
  );
};

export default AdminLayout;
