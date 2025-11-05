
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';
import { Election, Candidate } from '../types';

const VoterDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [elections] = useLocalStorage<Election[]>('electionData', []);
  const [candidates] = useLocalStorage<Candidate[]>('candidateData', []);
  
  const activeElections = elections.filter(e => e.status === 'Active');
  
  const [selectedElection, setSelectedElection] = useState<string>(activeElections.length > 0 ? activeElections[0].id : '');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [message, setMessage] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (user && selectedElection) {
      const voted = sessionStorage.getItem(`voted_${selectedElection}_${user}`);
      if (voted) {
        setHasVoted(true);
        setMessage('You have already voted in this election!');
      } else {
        setHasVoted(false);
        setMessage('');
      }
    }
  }, [selectedElection, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasVoted) return;
    if (!selectedCandidate) {
      setMessage('Please select a candidate to vote.');
      return;
    }
    if (user && selectedElection) {
      sessionStorage.setItem(`voted_${selectedElection}_${user}`, selectedCandidate);
      setHasVoted(true);
      setMessage('Vote submitted successfully! Thank you. You will be logged out in 3 seconds.');
      setTimeout(() => {
        logout();
      }, 3000);
    }
  };

  const electionCandidates = candidates.filter(c => c.electionID === selectedElection);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome, Voter {user}</h1>
        <p className="mb-6 text-white/80">Cast your vote below.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="electionSelect" className="block text-lg font-semibold mb-2">Select Election:</label>
            <select
              id="electionSelect"
              value={selectedElection}
              onChange={(e) => {
                setSelectedElection(e.target.value);
                setSelectedCandidate('');
              }}
              disabled={hasVoted}
              className="w-full p-3 bg-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              {activeElections.length > 0 ? (
                activeElections.map(e => <option key={e.id} value={e.id}>{e.name}</option>)
              ) : (
                <option>No active elections</option>
              )}
            </select>
          </div>

          {electionCandidates.length > 0 && (
            <div className="text-left bg-black/20 p-4 rounded-lg">
              <p className="font-semibold mb-3 text-center">Select a Candidate:</p>
              <div className="space-y-2">
                {electionCandidates.map(c => (
                  <label key={c.name} className="flex items-center p-3 bg-white/10 rounded-lg hover:bg-white/20 cursor-pointer transition">
                    <input
                      type="radio"
                      name="candidate"
                      value={`${c.name}|${c.designation}`}
                      checked={selectedCandidate === `${c.name}|${c.designation}`}
                      onChange={(e) => setSelectedCandidate(e.target.value)}
                      disabled={hasVoted}
                      className="w-5 h-5 mr-3 text-pink-500 bg-gray-700 border-gray-600 focus:ring-pink-600 ring-offset-gray-800 focus:ring-2"
                    />
                    <span>{c.name} ({c.designation})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={hasVoted || activeElections.length === 0}
            className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            {hasVoted ? 'Voted' : 'Submit Vote'}
          </button>
        </form>
        {message && <div className={`mt-4 font-semibold ${hasVoted ? 'text-yellow-300' : 'text-red-400'}`}>{message}</div>}
      </div>
    </div>
  );
};

export default VoterDashboard;
