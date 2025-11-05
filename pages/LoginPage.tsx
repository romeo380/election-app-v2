
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'voter'>('admin');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [voterUID, setVoterUID] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login('admin', { username: adminUsername, password: adminPassword });
    if (!success) {
      setError('Invalid admin credentials!');
    } else {
      setError('');
    }
  };

  const handleVoterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login('voter', { uid: voterUID });
    if (!success) {
      setError('Invalid Voter UID!');
    } else {
      setError('');
    }
  };
  
  const Tab: React.FC<{ type: 'admin' | 'voter'; children: React.ReactNode }> = ({ type, children }) => (
    <div
      onClick={() => { setActiveTab(type); setError(''); }}
      className={`cursor-pointer px-4 sm:px-8 py-3 font-semibold text-sm sm:text-base rounded-t-lg transition-colors duration-200 ${
        activeTab === type ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/40'
      }`}
    >
      {children}
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm mx-auto animate-pulse-slow">
        <h2 className="text-3xl font-bold text-center mb-6 text-shadow">Login to Voting Portal</h2>
        <div className="flex justify-center">
            <Tab type="admin">Admin Login</Tab>
            <Tab type="voter">Voter Login</Tab>
        </div>
        <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-b-lg rounded-tr-lg shadow-2xl">
            {error && <div className="bg-red-500/80 text-white p-3 rounded-md mb-4 text-center text-sm font-semibold">{error}</div>}
            
            {activeTab === 'admin' ? (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                    <input
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Admin Username"
                        className="w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-md border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                    />
                    <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-md border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                    />
                    <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-300">
                        Login as Admin
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVoterLogin} className="space-y-4">
                    <input
                        type="text"
                        value={voterUID}
                        onChange={(e) => setVoterUID(e.target.value)}
                        placeholder="Voter UID (e.g., V001)"
                        className="w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-md border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        required
                    />
                    <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-300">
                        Login as Voter
                    </button>
                </form>
            )}
        </div>
      </div>
       <style>{`
        .text-shadow {
          text-shadow: 2px 2px 10px rgba(0,0,0,0.4);
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
