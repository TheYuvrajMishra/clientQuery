// src/components/LoginPage.tsx
import React, { useState } from 'react';

// Define the structure for an authorized user
interface AuthorizedUser {
  username: string;
  password: string; // In a real app, store hashed passwords, not plain text!
}

// --- Authorized Users List ---
// In a real application, this data would come from a secure backend database.
// Storing credentials directly in frontend code is NOT secure.
// This is for demonstration purposes based on your request for a frontend-only check.
const AUTHORIZED_USERS: AuthorizedUser[] = [
  { username: 'yuvraj mishra', password: '123456' }
];

// Note: In this frontend-only example, the passwords are visible in the source code.
// For a real application, you MUST implement authentication on a secure backend
// and store hashed passwords in your database.

// Define props for the LoginPage component
interface LoginPageProps {
  // Function to call when login is successful
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // State for input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // State for error message
  const [error, setError] = useState<string | null>(null);
  // State for loading indicator
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    setError(null); // Clear previous errors
    setLoading(true); // Set loading state

    console.log(`Attempting frontend login check for username: ${username}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // --- Frontend Authentication Check ---
    // Find if a user with the entered username and password exists in our list
    const foundUser = AUTHORIZED_USERS.find(user =>
      user.username === username && user.password === password
    );

    if (foundUser) {
      console.log(`Frontend check successful for user: ${username}`);
      // Call the success handler passed from the parent component
      onLoginSuccess();
    } else {
      console.error(`Frontend check failed for user: ${username}`);
      setError('Invalid username or password.');
    }

    setLoading(false); // Clear loading state
    // --- End Frontend Authentication Check ---
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Manager Login
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Display error message if any */}
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className={`relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                 <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Logging in...
                 </span>
              ) : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
