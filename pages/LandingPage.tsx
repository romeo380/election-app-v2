
import React from 'react';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { showLogin } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md text-center bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 animate-pulse-slow">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-shadow">
          Welcome to the Voting Portal
        </h1>
        <p className="text-lg md:text-xl mb-8 text-white/90">
          Please log in for more information and to participate in voting.
        </p>
        <button
          onClick={showLogin}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-10 text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-pink-300"
        >
          Login
        </button>
      </div>
      <style>{`
        .text-shadow {
          text-shadow: 2px 2px 10px rgba(0,0,0,0.4);
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 12px 30px rgba(0,0,0,0.25); }
          50% { transform: scale(1.02); box-shadow: 0 18px 40px rgba(0,0,0,0.3); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
