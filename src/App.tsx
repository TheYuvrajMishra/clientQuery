// src/App.tsx
import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard'; // Assuming Dashboard is in a 'pages' directory
import LoginPage from './pages/LoginPage'; // Assuming LoginPage is in a 'pages' directory

// Define a key for storing auth status in localStorage
const AUTH_STORAGE_KEY = 'isAuthenticated';

function App() {
  // State to track authentication status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initialize state from localStorage on mount
    // This allows the user to stay logged in across page refreshes
    const storedAuthStatus = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedAuthStatus === 'true'; // localStorage stores strings, so check against 'true'
  });

  // Effect to update localStorage whenever isAuthenticated changes
  useEffect(() => {
    if (isAuthenticated) {
      // Store 'true' when the user is authenticated
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } else {
      // Remove the key when the user logs out
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [isAuthenticated]); // Dependency array: re-run this effect only when isAuthenticated changes

  // Function to handle successful login from the LoginPage component
  const handleLoginSuccess = () => {
    console.log("Login successful, updating isAuthenticated state.");
    setIsAuthenticated(true);
  };

  return (
    <div className="App">
      {/* Conditionally render LoginPage or Dashboard based on authentication status */}
      {isAuthenticated ? (
        // If isAuthenticated is true, show the Dashboard
        // You might pass the handleLogout function down if you add a logout button to your Dashboard
        <Dashboard />
      ) : (
        // If isAuthenticated is false, show the LoginPage
        // Pass the handleLoginSuccess function to the LoginPage
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
