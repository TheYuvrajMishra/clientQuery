// src/services/customerService.ts
import type { CustomerData } from '../types';

const LOCAL_STORAGE_KEY = 'customerQueriesData';

// Helper to load data from localStorage
const loadDataFromStorage = (): CustomerData[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      // Add basic validation if needed
      return JSON.parse(data) as CustomerData[];
    }
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
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
  }
};

// --- SIMULATED BACKEND DATA & LOGIC (using localStorage for persistence) ---

// Initial mock data function - only used if localStorage is empty
const generateInitialMockData = (): CustomerData[] => {
    return [
        {
            id: `query-${Date.now()}-abc`,
            queryTime: new Date(Date.now() - Math.random() * 5 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            name: 'Alice Wonderland',
            email: 'alice@example.com',
            topic: 'Regarding my recent order',
            status: Math.random() > 0.3 ? 'pending' : 'replied',
            message: "Hi, I haven't received my order placed last week. The tracking number is #XYZ789. Can you please check the status? Thanks!", // <--- Added message
        },
        {
            id: `query-${Date.now()}-def`,
            queryTime: new Date(Date.now() - Math.random() * 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            name: 'Bob The Builder',
            email: 'bob@example.net',
            topic: 'Question about pricing plans',
            status: Math.random() > 0.3 ? 'pending' : 'replied',
             message: "Hello, I'm interested in your premium plan but need to know if it includes feature X. Your pricing page isn't clear on this. Could you clarify?", // <--- Added message
        },
        {
            id: `query-${Date.now()}-ghi`,
            queryTime: new Date(Date.now() - Math.random() * 2 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            name: 'Charlie Chaplin',
            email: 'charlie@example.org',
            topic: 'Need technical assistance',
            status: Math.random() > 0.3 ? 'pending' : 'replied',
             message: "My account seems to be locked. I've tried resetting my password but didn't receive the email. My username is 'funnyhat'. Please help!", // <--- Added message
        },
        {
            id: `query-${Date.now()}-jkl`,
            queryTime: new Date(Date.now() - Math.random() * 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            name: 'Diana Prince',
            email: 'diana@example.com',
            topic: 'Feedback on new feature',
            status: Math.random() > 0.3 ? 'pending' : 'replied',
             message: "Just wanted to say I love the new dark mode feature! It's much easier on the eyes. Great job to the dev team!", // <--- Added message
        },
    ];
};

// Internal state managed by the service
let currentCustomerData: CustomerData[] = [];

// Initialize data: try loading from storage, otherwise use mock data
const initializeData = () => {
    currentCustomerData = loadDataFromStorage();
    // Check if loaded data is empty or if it's old data without the message field (basic check)
    if (currentCustomerData.length === 0 || !currentCustomerData[0]?.message) {
        console.log("Initializing/Regenerating data with messages.");
        currentCustomerData = generateInitialMockData();
        saveDataToStorage(currentCustomerData);
    } else {
         console.log("Loaded data from localStorage including messages.");
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
                message: `This is a simulated urgent message from a new customer (${Math.random().toFixed(4)}). Please attend to this promptly.`, // <--- Added message for new queries
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

// --- END OF SIMULATED BACKEND DATA & LOGIC ---