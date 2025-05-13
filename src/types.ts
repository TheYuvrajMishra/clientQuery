// src/types.ts

export interface CustomerData {
  id: string; // Unique ID for the key prop
  queryTime: string; // Time the query was received/recorded
  name: string;
  email: string;
  topic: string;
  status: 'pending' | 'replied'; // Added status field
  message: string; // <--- Added message field
}

// Define types for filters
export type FilterStatus = 'all' | 'pending' | 'replied';