// src/services/customerService.ts
import type { CustomerData } from '../types';

const LOCAL_STORAGE_KEY = 'customerQueriesData';

// Helper to load data from localStorage
const loadDataFromStorage = (): CustomerData[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      // Add basic validation if needed
      const parsedData = JSON.parse(data) as CustomerData[];
      // Basic check to ensure loaded data has the 'message' field
      if (parsedData.length > 0 && !parsedData[0]?.message) {
           console.warn("Loaded data from localStorage is missing 'message' field, regenerating mock data.");
           // Clear old data before regenerating
           localStorage.removeItem(LOCAL_STORAGE_KEY);
           return generateInitialMockData(); // Regenerate if structure is old
      }
      return parsedData;
    }
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
    // If loading fails, clear storage to prevent persistent errors
    clearAllCustomerData(); // Use the existing clear function
  }
  return []; // Return empty array if no data or error
};

// Helper to save data to localStorage
const saveDataToStorage = (data: CustomerData[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
    // Handle potential storage limits or errors if necessary
    alert("Warning: Could not save data to local storage. Your changes might not persist.");
  }
};

// --- SIMULATED BACKEND DATA & LOGIC (using localStorage for persistence) ---

// Initial mock data function - only used if localStorage is empty or invalid
const generateInitialMockData = (): CustomerData[] => {
    console.log("Service: Generating initial mock data...");
    return [
        {
            id: `query-${Date.now()}-abc`,
            queryTime: new Date(Date.now() - Math.random() * 5 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            name: 'Alice Wonderland',
            email: 'alice@example.com',
            topic: 'Regarding my recent order',
            status: Math.random() > 0.3 ? 'pending' : 'replied',
            message: "Hi, I haven't received my order placed last week. The tracking number is #XYZ789. Can you please check the status? Thanks!",
        },
        {
            id: `query-${Date.now()}-def`,
            queryTime: new Date(Date.now() - Math.random() * 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            name: 'Bob The Builder',
            email: 'bob@example.net',
            topic: 'Question about pricing plans',
            status: Math.random() > 0.3 ? 'pending' : 'replied',
             message: "Hello, I'm interested in your premium plan but need to know if it includes feature X. Your pricing page isn't clear on this. Could you clarify?",
        },
        {
            id: `query-${Date.now()}-ghi`,
            queryTime: new Date(Date.now() - Math.random() * 2 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            name: 'Charlie Chaplin',
            email: 'charlie@example.org',
            topic: 'Need technical assistance',
            status: Math.random() > 0.3 ? 'pending' : 'replied',
             message: "My account seems to be locked. I've tried resetting my password but didn't receive the email. My username is 'funnyhat'. Please help!",
        },
        {
            id: `query-${Date.now()}-jkl`,
            queryTime: new Date(Date.now() - Math.random() * 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            name: 'Diana Prince',
            email: 'diana@example.com',
            topic: 'Feedback on new feature',
            status: Math.random() > 0.3 ? 'pending' : 'replied',
             message: "Just wanted to say I love the new dark mode feature! It's much easier on the eyes. Great job to the dev team!",
        },
    ];
};

// Internal state managed by the service
let currentCustomerData: CustomerData[] = [];

// Initialize data: try loading from storage, otherwise use mock data
const initializeData = () => {
    currentCustomerData = loadDataFromStorage();
    // loadDataFromStorage now handles regeneration if needed
    if (currentCustomerData.length === 0) {
         console.log("Data is still empty after load attempt, generating initial mock data.");
         currentCustomerData = generateInitialMockData();
         saveDataToStorage(currentCustomerData);
    } else {
         console.log("Data initialized from localStorage.");
    }
};

// Initialize when the service is first imported
initializeData();


// Simulate fetching data
export const fetchLiveCustomerData = (): Promise<CustomerData[]> => {
  console.log("Service: Simulating data fetch...");
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.95) {
        // Simulate occasionally adding a new 'pending' query to the *internal state*
        if (Math.random() > 0.7) {
             const newQuery: CustomerData = {
                id: `query-${Date.now()}-new`,
                queryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                name: 'New Customer ' + Math.floor(Math.random()*100),
                email: `new.customer${Date.now()}@example.xyz`,
                topic: 'Urgent question ' + Math.random().toFixed(2),
                status: 'pending', // New queries are always pending
                message: `This is a simulated urgent message from a new customer (${Math.random().toFixed(4)}). Please attend to this promptly.`,
             };
             currentCustomerData = [newQuery, ...currentCustomerData]; // Add new query
             saveDataToStorage(currentCustomerData); // Save the updated state
             console.log("Service: Added new simulated query.");
        }
        resolve([...currentCustomerData]); // Return a copy of the current state
      } else {
        reject(new Error("Service: Failed to connect to customer data service."));
      }
    }, 500 + Math.random() * 1000);
  });
};

// Simulate updating the status
export const updateQueryStatus = (queryId: string, status: CustomerData['status']): Promise<boolean> => {
  console.log(`Service: Simulating update for query ${queryId} to status: ${status}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = currentCustomerData.findIndex(c => c.id === queryId);

      if (index > -1) {
        if (Math.random() < 0.9) { // 90% chance of success
          // Update the status in the internal state
          currentCustomerData = currentCustomerData.map(customer =>
            customer.id === queryId ? { ...customer, status: status } : customer
          );
          saveDataToStorage(currentCustomerData); // Save the updated state
          console.log(`Service: Simulated update successful for ${queryId}.`);
          resolve(true); // Indicate success
        } else {
          console.error(`Service: Simulated update failed for ${queryId}.`);
          reject(new Error("Service: Failed to update status on backend."));
        }
      } else {
         console.error(`Service: Query ${queryId} not found for update.`);
         reject(new Error(`Service: Query ${queryId} not found.`));
      }
    }, 300 + Math.random() * 500);
  });
};

// Function to clear all data (kept for robustness, though not used by a button now)
export const clearAllCustomerData = (): void => { // Changed to void as it's synchronous now
    console.log("Service: Clearing all customer data...");
    currentCustomerData = []; // Clear the internal state
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Remove from localStorage
    console.log("Service: All customer data cleared.");
};

// --- NEW: Function to delete a single customer ---
export const deleteCustomer = (queryId: string): Promise<boolean> => {
    console.log(`Service: Simulating deleting query ${queryId}...`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const initialLength = currentCustomerData.length;
            // Filter out the customer to be deleted
            currentCustomerData = currentCustomerData.filter(customer => customer.id !== queryId);

            if (currentCustomerData.length < initialLength) {
                saveDataToStorage(currentCustomerData); // Save the updated state
                console.log(`Service: Simulated delete successful for ${queryId}.`);
                resolve(true); // Indicate success
            } else {
                 console.error(`Service: Query ${queryId} not found for deletion.`);
                 reject(new Error(`Service: Query ${queryId} not found.`));
            }
        }, 300 + Math.random() * 500); // Simulate delay
    });
};
// --- END NEW ---

// --- END OF SIMULATED BACKEND DATA & LOGIC ---