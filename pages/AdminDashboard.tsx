
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Voter } from '../types';

interface UserData {
  id: string;
  name: string;
  color: string;
  password?: string;
}

const AdminDashboard: React.FC = () => {
  const [voterData] = useLocalStorage<Voter[]>('voterData', []);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [filter, setFilter] = useState('');
  const [importStatus, setImportStatus] = useState('');

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (rows.length < 2) {
          setImportStatus("File is empty or has no data rows.");
          return;
        }

        const header = rows[0].map(h => String(h).toLowerCase().trim());
        const nameCol = header.indexOf("name");
        const colorCol = header.indexOf("house color") >= 0 ? header.indexOf("house color") : header.indexOf("color");

        if (nameCol < 0 || colorCol < 0) {
          setImportStatus("Missing 'name' or 'house color' column!");
          return;
        }

        const newUserData = rows.slice(1).map((row, index) => {
          const name = String(row[nameCol] || '').trim().toUpperCase();
          const color = String(row[colorCol] || '').trim().toUpperCase();
          const userID = voterData.find(v => v.name.toUpperCase() === name)?.uid || `U${(index + 1).toString().padStart(3, '0')}`;
          const colorInitial = color ? color[0] : '';
          const password = `${name.split(' ')[0]}@123${colorInitial}`;
          return { id: userID, name, color, password };
        }).filter(u => u.name && u.color);
        
        setUserData(newUserData);
        setImportStatus("Import successful!");
      } catch (err) {
        setImportStatus("Failed to process file.");
        console.error(err);
      }
      setTimeout(() => setImportStatus(''), 3000);
    };
    reader.readAsArrayBuffer(file);
  };
  
  const handleExport = () => {
    const dataToExport = filteredUsers.map(({id, name, color, password}) => ({ "User ID": id, "Name": name, "House Color": color, "Password": password }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users_export.xlsx");
  };

  const filteredUsers = userData.filter(user =>
    user.id.toLowerCase().includes(filter.toLowerCase()) ||
    user.name.toLowerCase().includes(filter.toLowerCase()) ||
    user.color.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">👑</div>
        <h1 className="text-3xl font-bold">Welcome, Admin!</h1>
        <p className="text-white/80 mt-2">Manage users and view information securely.</p>
      </div>

      <div className="bg-white/10 p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <label htmlFor="importExcel" className="text-sm font-semibold cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full transition-transform transform hover:scale-105">
          Import Excel/CSV
        </label>
        <input type="file" id="importExcel" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
        <button onClick={handleExport} className="text-sm font-semibold bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-full transition-transform transform hover:scale-105">
          Export to Excel
        </button>
        {importStatus && <span className="text-sm text-yellow-300 font-semibold">{importStatus}</span>}
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter users by ID, name, or color..."
          className="w-full p-3 bg-white/20 text-white rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-white/60"
        />
        <div className="overflow-x-auto bg-black/20 rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/30 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">User ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">House Color</th>
                <th className="px-6 py-3">Generated Password</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="px-6 py-4 font-medium">{user.id}</td>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.color}</td>
                  <td className="px-6 py-4 font-mono">{user.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && <p className="text-center p-4 text-white/70">No users to display. Please import a file.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
