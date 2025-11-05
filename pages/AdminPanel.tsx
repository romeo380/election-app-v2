
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Election, Candidate, Voter } from '../types';

type Section = 'election' | 'candidate' | 'voter';

const AdminPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('election');
  const [electionData, setElectionData] = useLocalStorage<Election[]>('electionData', []);
  const [candidateData, setCandidateData] = useLocalStorage<Candidate[]>('candidateData', []);
  const [voterData, setVoterData] = useLocalStorage<Voter[]>('voterData', []);

  // Form states
  const [electionForm, setElectionForm] = useState({ id: '', name: '', status: 'Upcoming', date: '' });
  const [candidateForm, setCandidateForm] = useState({ electionID: '', name: '', designation: '' });
  const [voterForm, setVoterForm] = useState({ name: '', class: '', color: '' });
  const [voterStatus, setVoterStatus] = useState('');

  const handleAddElection = (e: React.FormEvent) => {
    e.preventDefault();
    if (electionForm.id && electionForm.name && electionForm.date) {
      setElectionData([...electionData, { ...electionForm, status: electionForm.status as 'Upcoming' | 'Active' | 'Completed' }]);
      setElectionForm({ id: '', name: '', status: 'Upcoming', date: '' });
    }
  };

  const handleDeleteElection = (id: string) => {
    setElectionData(electionData.filter(e => e.id !== id));
    setCandidateData(candidateData.filter(c => c.electionID !== id));
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const electionID = candidateForm.electionID || (electionData.length > 0 ? electionData[0].id : '');
    if (electionID && candidateForm.name && candidateForm.designation) {
      setCandidateData([...candidateData, { ...candidateForm, electionID }]);
      setCandidateForm({ electionID: '', name: '', designation: '' });
    }
  };

  const handleDeleteCandidate = (index: number) => {
    setCandidateData(candidateData.filter((_, i) => i !== index));
  };
  
  const generateUID = (index: number) => `V${(index + 1).toString().padStart(3, '0')}`;

  const handleAddVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (voterForm.name && voterForm.class && voterForm.color) {
      const uid = generateUID(voterData.length);
      setVoterData([...voterData, { ...voterForm, uid }]);
      setVoterForm({ name: '', class: '', color: '' });
    }
  };
  
  const handleDeleteVoter = (uid: string) => {
    setVoterData(voterData.filter(v => v.uid !== uid));
  };

  const handleVoterImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rows.length < 2) return;

        const header = rows[0].map(h => String(h).toLowerCase().trim());
        const nameCol = header.indexOf("name");
        const classCol = header.indexOf("class");
        const colorCol = header.indexOf("house color") >= 0 ? header.indexOf("house color") : header.indexOf("color");
        
        const newVoters = rows.slice(1).map((row, i) => {
            const name = String(row[nameCol] || '').trim();
            const vclass = String(row[classCol] || '').trim();
            const color = String(row[colorCol] || '').trim();
            if (name && vclass && color) {
                return { uid: generateUID(i), name, class: vclass, color };
            }
            return null;
        }).filter((v): v is Voter => v !== null);

        setVoterData(newVoters);
        setVoterStatus("Import successful!");
      } catch (err) {
        setVoterStatus("Failed to process file.");
      }
      setTimeout(() => setVoterStatus(""), 3000);
    };
    reader.readAsArrayBuffer(file);
  };

  const exportVoters = () => {
    const data = [["UID", "Name", "Class", "House Color"], ...voterData.map(v => [v.uid, v.name, v.class, v.color])];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Voters");
    XLSX.writeFile(wb, "voter_list.xlsx");
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'election':
        return (
          <div>
            <form onSubmit={handleAddElection} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 p-4 bg-black/20 rounded-lg">
              <input type="text" placeholder="ID" value={electionForm.id} onChange={e => setElectionForm({ ...electionForm, id: e.target.value })} className="bg-white/20 p-2 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400"/>
              <input type="text" placeholder="Election Name" value={electionForm.name} onChange={e => setElectionForm({ ...electionForm, name: e.target.value })} className="bg-white/20 p-2 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400"/>
              <select value={electionForm.status} onChange={e => setElectionForm({ ...electionForm, status: e.target.value })} className="bg-white/20 p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-pink-400"><option>Upcoming</option><option>Active</option><option>Completed</option></select>
              <input type="date" value={electionForm.date} onChange={e => setElectionForm({ ...electionForm, date: e.target.value })} className="bg-white/20 p-2 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400"/>
              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">Add Election</button>
            </form>
            <div className="overflow-x-auto bg-black/20 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-black/30"><tr><th className="p-3">ID</th><th>Name</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>{electionData.map(e => (<tr key={e.id} className="border-b border-white/10 hover:bg-white/10">
                  <td className="p-3">{e.id}</td><td>{e.name}</td><td>{e.status}</td><td>{e.date}</td>
                  <td><button onClick={() => handleDeleteElection(e.id)} className="bg-red-500 text-xs text-white p-1 px-2 rounded-full">Delete</button></td>
                </tr>))}</tbody>
              </table>
            </div>
          </div>
        );
      case 'candidate':
        return (
          <div>
            <form onSubmit={handleAddCandidate} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 p-4 bg-black/20 rounded-lg">
                <select value={candidateForm.electionID} onChange={e => setCandidateForm({...candidateForm, electionID: e.target.value})} className="bg-white/20 p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-pink-400">
                    {electionData.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <input type="text" placeholder="Candidate Name" value={candidateForm.name} onChange={e => setCandidateForm({...candidateForm, name: e.target.value})} className="bg-white/20 p-2 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                <input type="text" placeholder="Designation" value={candidateForm.designation} onChange={e => setCandidateForm({...candidateForm, designation: e.target.value})} className="bg-white/20 p-2 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">Add Candidate</button>
            </form>
            <div className="overflow-x-auto bg-black/20 rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-black/30"><tr><th className="p-3">Election</th><th>Name</th><th>Designation</th><th>Action</th></tr></thead>
                    <tbody>{candidateData.map((c, i) => (<tr key={i} className="border-b border-white/10 hover:bg-white/10">
                        <td className="p-3">{electionData.find(e => e.id === c.electionID)?.name || c.electionID}</td><td>{c.name}</td><td>{c.designation}</td>
                        <td><button onClick={() => handleDeleteCandidate(i)} className="bg-red-500 text-xs text-white p-1 px-2 rounded-full">Delete</button></td>
                    </tr>))}</tbody>
                </table>
            </div>
          </div>
        );
      case 'voter':
        return (
          <div>
            <form onSubmit={handleAddVoter} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 p-4 bg-black/20 rounded-lg">
                <input type="text" placeholder="Name" value={voterForm.name} onChange={e => setVoterForm({...voterForm, name: e.target.value})} className="bg-white/20 p-2 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                <input type="text" placeholder="Class" value={voterForm.class} onChange={e => setVoterForm({...voterForm, class: e.target.value})} className="bg-white/20 p-2 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                <input type="text" placeholder="House Color" value={voterForm.color} onChange={e => setVoterForm({...voterForm, color: e.target.value})} className="bg-white/20 p-2 rounded text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">Add Voter</button>
            </form>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-black/20 rounded-lg mb-4">
                <label htmlFor="voterExcel" className="text-sm font-semibold cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full transition-transform transform hover:scale-105">Import Voters</label>
                <input type="file" id="voterExcel" accept=".xlsx,.xls,.csv" onChange={handleVoterImport} className="hidden" />
                <button onClick={exportVoters} className="text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-full transition-transform transform hover:scale-105">Export Voters</button>
                {voterStatus && <span className="text-sm text-yellow-300 font-semibold">{voterStatus}</span>}
            </div>
            <div className="overflow-x-auto bg-black/20 rounded-lg">
                 <table className="w-full text-sm">
                    <thead className="bg-black/30"><tr><th className="p-3">UID</th><th>Name</th><th>Class</th><th>House Color</th><th>Action</th></tr></thead>
                    <tbody>{voterData.map(v => (<tr key={v.uid} className="border-b border-white/10 hover:bg-white/10">
                        <td className="p-3">{v.uid}</td><td>{v.name}</td><td>{v.class}</td><td>{v.color}</td>
                        <td><button onClick={() => handleDeleteVoter(v.uid)} className="bg-red-500 text-xs text-white p-1 px-2 rounded-full">Delete</button></td>
                    </tr>))}</tbody>
                </table>
            </div>
          </div>
        );
      default: return null;
    }
  };
  
  const SectionButton: React.FC<{ section: Section, children: React.ReactNode }> = ({ section, children }) => (
    <button onClick={() => setActiveSection(section)} className={`px-4 py-2 rounded-t-lg font-semibold transition ${activeSection === section ? 'bg-white/20 text-white' : 'bg-black/20 text-gray-300 hover:bg-black/30'}`}>
      {children}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex border-b border-white/20">
        <SectionButton section="election">Election Management</SectionButton>
        <SectionButton section="candidate">Candidate Management</SectionButton>
        <SectionButton section="voter">Voter List</SectionButton>
      </div>
      <div className="bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-b-lg shadow-lg">
        {renderSection()}
      </div>
    </div>
  );
};

export default AdminPanel;
