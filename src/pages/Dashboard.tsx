// src/components/Dashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { CustomerData, FilterStatus } from '../types'; // Import types
// Import the service functions, including the new clearAllCustomerData
import { fetchLiveCustomerData, updateQueryStatus, clearAllCustomerData } from '../services/customerService';

// Simple Modal Component (Can be extracted to its own file later)
interface DetailsModalProps {
    customer: CustomerData;
    onClose: () => void;
    onMarkAsReplied: (id: string) => void; // Pass handler down
    onEmailCustomer: (email: string) => void; // Pass handler down
    isUpdating: boolean; // Pass updating state down
}

const DetailsModal: React.FC<DetailsModalProps> = ({
    customer,
    onClose,
    onMarkAsReplied,
    onEmailCustomer,
    isUpdating
}) => {
    // Prevent propagation for the modal content itself
    const handleModalContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        // Overlay
        <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center"
            onClick={onClose} // Close modal when clicking outside content
        >
            {/* Modal content */}
            <div
                className="relative p-8 border w-full max-w-lg md:max-w-xl lg:max-w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto" // Added max-h and overflow-y
                onClick={handleModalContentClick} // Prevent closing when clicking inside content
            >
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    onClick={onClose} // Close button
                >
                    &times;
                </button>

                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Query Details</h3>

                <div className="space-y-3 text-gray-700 text-sm">
                    <p><span className="font-medium">Time:</span> {customer.queryTime}</p>
                    <p><span className="font-medium">Name:</span> {customer.name}</p>
                    <p>
                       <span className="font-medium">Email:</span>
                       <a
                           href={`mailto:${customer.email}`}
                           className="text-blue-600 hover:underline ml-1"
                           onClick={(e) => { // Stop propagation for email link in modal
                               e.stopPropagation();
                               onEmailCustomer(customer.email); // Use the passed handler
                           }}
                       >
                           {customer.email}
                       </a>
                    </p>
                     <p><span className="font-medium">Topic:</span> {customer.topic}</p>
                     <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="font-medium text-gray-800 mb-2">Client Message:</p>
                        <div className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap text-gray-800 text-sm border border-gray-200"> {/* Styled message block */}
                            {customer.message}
                        </div>
                     </div>
                </div>

                 {/* Modal Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                    {customer.status === 'pending' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Stop propagation for button in modal
                                onMarkAsReplied(customer.id); // Use the passed handler
                            }}
                            className={`bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isUpdating} // Disable while updating
                        >
                            {isUpdating ? (
                                <span className="flex items-center justify-center">
                                   <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                   Updating...
                                </span>
                            ) : 'Mark as Replied'}
                        </button>
                    )}
                     <button
                         onClick={(e) => {
                              e.stopPropagation(); // Stop propagation for button in modal
                             onEmailCustomer(customer.email); // Use the passed handler
                         }}
                         className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus="ring-blue-500 focus:ring-opacity-50 transition duration-200 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={isUpdating}
                     >
                       Email Customer
                     </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all'); // Use FilterStatus type
  const [updatingId, setUpdatingId] = useState<string | null>(null); // Track which query is being updated
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null); // State to track selected card for modal
  const [clearingData, setClearingData] = useState(false); // <--- New state for clearing data

  // Effect to fetch and update data
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (customers.length === 0 && !error) {
         setLoading(true);
      } else {
         console.log("Polling for new data...");
      }

      try {
        const data = await fetchLiveCustomerData();
        if (isMounted) {
          setCustomers(data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching customer data:", err);
        if (isMounted) {
           if (customers.length === 0) {
               setError("Failed to load customer data. Please try again later.");
           }
        }
      } finally {
        if (isMounted) {
          if (customers.length === 0 || !error) {
              setLoading(false);
          }
        }
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 15000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [customers.length, error]);

  const filteredCustomers = useMemo(() => {
    if (filter === 'all') {
      return customers;
    } else {
      return customers.filter(customer => customer.status === filter);
    }
  }, [customers, filter]);

    // Find the customer data for the selected modal
    const selectedCustomer = useMemo(() => {
       return customers.find(c => c.id === selectedCustomerId) || null;
    }, [customers, selectedCustomerId]);


  // Function to handle opening the modal
  const handleCardClick = (customerId: string) => {
       setSelectedCustomerId(customerId);
  };

   // Function to handle closing the modal
   const handleCloseModal = () => {
       setSelectedCustomerId(null);
   };


  // Function to handle the email button click (used by modal)
  const handleEmailClick = (email: string) => {
    console.log(`Attempting to open email client for: ${email}`);
    // window.location.href = `mailto:${email}`; // Uncomment if you want this to happen directly
  };

  // Function to handle marking a query as replied/action taken (used by modal)
  const handleMarkAsReplied = async (queryId: string) => {
    const customerToUpdate = customers.find(c => c.id === queryId);

    if (!customerToUpdate || customerToUpdate.status === 'replied' || updatingId) {
       console.log(`Prevented update for ${queryId}. Status: ${customerToUpdate?.status}, updatingId: ${updatingId}`);
       return;
    }

    setUpdatingId(queryId);

    try {
      const success = await updateQueryStatus(queryId, 'replied');

      if (success) {
        setCustomers(prevCustomers =>
          prevCustomers.map(customer =>
            customer.id === queryId ? { ...customer, status: 'replied' } : customer
          )
        );
        console.log(`Query ${queryId} marked as replied locally.`);
        // Close the modal after successful update
        handleCloseModal();

      } else {
         alert(`Failed to mark query ${queryId} as replied.`);
      }
    } catch (err: any) {
      console.error(`Error marking query ${queryId} as replied:`, err);
      alert(`An error occurred while marking query ${queryId} as replied: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // <--- NEW: Function to handle clearing all data ---
  const handleClearData = async () => {
      // Use window.confirm for a simple confirmation dialog
      const isConfirmed = window.confirm("Are you sure you want to clear ALL customer data? This action cannot be undone.");

      if (isConfirmed) {
          setClearingData(true); // Indicate that clearing is in progress
          try {
              await clearAllCustomerData(); // Call the service function
              setCustomers([]); // Clear local state
              setSelectedCustomerId(null); // Close the modal if open
              console.log("Customer data cleared successfully.");
          } catch (err) {
              console.error("Error clearing customer data:", err);
              alert("Failed to clear customer data."); // Provide feedback on failure
          } finally {
              setClearingData(false); // Reset clearing state
          }
      } else {
          console.log("Data clearing cancelled.");
      }
  };
  // <--- END NEW ---


  // Get counts for filters
  const pendingCount = customers.filter(c => c.status === 'pending').length;
  const repliedCount = customers.filter(c => c.status === 'replied').length;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Dashboard Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Client Query Requests
        </h1>
        {/* Filter Buttons / Status Counts / Clear Data Button */}
        <div className="flex flex-wrap items-center gap-3"> {/* Added items-center */}
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'}`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-50'}`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('replied')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${filter === 'replied' ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'}`}
          >
            Replied ({repliedCount})
          </button>

          {/* <--- NEW: Clear Data Button ---> */}
          
           {/* <--- END NEW ---> */}

        </div>
      </div>

      {/* Temporary Storage Info */}
       <div className="mb-6 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded-md text-sm">
           <p><strong>Note:</strong> Data is currently stored temporarily in your browser's Local Storage and will persist across page refreshes. This will be replaced by a database connection later.</p>
       </div>

      {/* Loading, Error, and Empty States */}
      {loading && customers.length === 0 && !error && (
         <div className="flex justify-center items-center h-64 col-span-full">
            <p className="text-xl text-gray-600 animate-pulse">Loading customer queries...</p>
         </div>
      )}
      {!loading && error && (
         <div className="flex justify-center items-center h-64 col-span-full">
            <p className="text-xl text-red-600">{error}</p>
         </div>
      )}
      {!loading && !error && customers.length === 0 && filter === 'all' && (
         <div className="flex justify-center items-center h-64 col-span-full">
           <p className="text-xl text-gray-600">No customer queries available.</p>
         </div>
      )}
       {!loading && !error && filteredCustomers.length === 0 && filter !== 'all' && (
         <div className="flex justify-center items-center h-64 col-span-full">
           <p className="text-xl text-gray-600">No customer queries matching the '{filter}' filter.</p>
         </div>
      )}


      {/* Customer Data Grid */}
      {filteredCustomers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCustomers.map((customer) => (
             // Card styling without inline expansion details
            <div
              key={customer.id}
              className={`bg-white rounded-lg shadow-md p-6 flex flex-col justify-between
                         border-t-4 ${customer.status === 'pending' ? 'border-yellow-500' : 'border-green-500'}
                         cursor-pointer select-none transition-shadow duration-200 ease-in-out hover:shadow-lg`}
               onClick={() => handleCardClick(customer.id)} // Trigger modal open on card click
            >
              <div>
                 {/* Status Badge */}
                 <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 ${
                    customer.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'
                 }`}>
                    {customer.status === 'pending' ? 'Pending' : 'Replied'}
                 </span>
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-medium text-gray-700">Time:</span> {customer.queryTime}
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{customer.name}</h3>
                 {/* Email is part of the summary, still clickable */}
                <p
                   className="text-blue-600 text-sm mb-2 truncate hover:text-clip cursor-pointer"
                   title={`Email: ${customer.email}`}
                   onClick={(e) => {
                       e.stopPropagation();
                       handleEmailClick(customer.email);
                   }}
                >
                    {customer.email}
                </p>
                <p className="text-gray-700 text-base mb-4">
                  <span className="font-medium text-gray-700">Topic:</span> {customer.topic}
                </p>
              </div>
               <div className="flex flex-col space-y-2 mt-auto pt-4 border-t border-gray-100">
                     <button
                       onClick={(e) => {
                             e.stopPropagation();
                             handleEmailClick(customer.email);
                       }}
                       className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus="ring-blue-500 focus:ring-opacity-50 transition duration-200 ${updatingId === customer.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={updatingId === customer.id}
                     >
                       Email Customer
                     </button>
               </div>

            </div>
          ))}
        </div>
      )}

        {/* Modal Rendering */}
        {selectedCustomer && (
            <DetailsModal
                customer={selectedCustomer}
                onClose={handleCloseModal}
                onMarkAsReplied={handleMarkAsReplied}
                onEmailCustomer={handleEmailClick}
                isUpdating={updatingId === selectedCustomer.id}
            />
        )}


        <button
           onClick={handleClearData}
           className={`fixed bottom-6 right-6 px-6 py-3 rounded-full text-sm font-medium bg-red-600 text-white shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200 ease-in-out z-40 flex items-center justify-center ${clearingData ? 'opacity-50 cursor-not-allowed' : ''}`}
           disabled={clearingData} // Disable button while clearing
        >
           {clearingData ? (
              <span className="flex items-center">
                 <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Clearing...
              </span>
           ) : 'Clear All Data'}
        </button>

    </div>
  );
};

export default Dashboard;
