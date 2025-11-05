export interface Election {
  id: string;
  name: string;
  status: 'Upcoming' | 'Active' | 'Completed';
  date: string;
}

export interface Candidate {
  electionID: string;
  name: string;
  designation: string;
}

export interface Voter {
  uid: string;
  name: string;
  class: string;
  color: string;
}

// Global declaration for the XLSX library loaded from CDN
// FIX: Use `declare global` because this file is a module (it has exports). This makes the XLSX type available globally.
declare global {
  var XLSX: any;
}