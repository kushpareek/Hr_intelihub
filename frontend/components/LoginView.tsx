// frontend/components/LoginView.tsx
import React, { useState } from 'react';
import { SparklesIcon, LoadingSpinner } from './common/IconComponents';
import { apiClient } from '../services/api'; // Import apiClient
import { User, SubscriptionTier } from '../types'; // Assuming User and SubscriptionTier are defined

interface LoginViewProps {
  onLoginSuccess: (user: User, token: string) => void; // Pass user and token
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [name, setName] = useState<string>(''); // For registration
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // const url = isRegistering ? `${API_BASE_URL}/auth/register` : `${API_BASE_URL}/auth/login`; // Remove this
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    const payload = isRegistering
      ? { name, email, password }
      : { email, password };

    try {
      // Replace fetch with apiClient
      const data = await apiClient<{ user: User; token: string; }>(
        endpoint,
        'POST',
        payload,
        { useAuth: false } // Indicate that auth token is not needed for this request
      );

      // data is already parsed JSON
      if (data.user && data.token) {
        onLoginSuccess(data.user, data.token); // No need to cast data.user if apiClient is typed
      } else {
        // This case should ideally be covered by apiClient's error handling if the response shape is wrong,
        // or by backend ensuring consistent responses.
        throw new Error('Login failed: No user or token in response.');
      }

    } catch (err: any) {
      console.error(`Error during ${isRegistering ? 'registration' : 'login'}:`, err);
      setError(err.message || `An error occurred during ${isRegistering ? 'registration' : 'login'}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <SparklesIcon className="w-16 h-16 mx-auto text-blue-600 mb-3" />
          <h1 className="text-3xl font-bold text-gray-800">HR IntelliHub</h1>
          <p className="text-gray-500 mt-1">{isRegistering ? 'Create your account' : 'Sign in to continue'}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isLoading && <LoadingSpinner className="mr-2" size={5} />}
              {isRegistering ? 'Register' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {setIsRegistering(!isRegistering); setError(null);}}
            className="font-medium text-blue-600 hover:text-blue-500 text-sm"
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
       <p className="text-center text-sm text-gray-400 mt-8">&copy; {new Date().getFullYear()} HR IntelliHub. All rights reserved.</p>
    </div>
  );
};

export default LoginView;