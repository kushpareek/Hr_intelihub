import React, { useState } from 'react';
import { LockClosedIcon, SparklesIcon, LoadingSpinner } from './common/IconComponents';
import { MOCK_USER_CREDENTIALS, MOCK_ADMIN_CREDENTIALS } from '../constants';
import { SubscriptionTier } from '../types';

interface LoginViewProps {
  onLoginSuccess: (email: string, name?: string, tier?: SubscriptionTier, isAdmin?: boolean) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email === MOCK_ADMIN_CREDENTIALS.email && password === MOCK_ADMIN_CREDENTIALS.password) {
        onLoginSuccess(
            MOCK_ADMIN_CREDENTIALS.email, 
            MOCK_ADMIN_CREDENTIALS.name, 
            MOCK_ADMIN_CREDENTIALS.tier, 
            true // isAdmin
        );
      } else if (email === MOCK_USER_CREDENTIALS.email && password === MOCK_USER_CREDENTIALS.password) {
        onLoginSuccess(
            MOCK_USER_CREDENTIALS.email, 
            MOCK_USER_CREDENTIALS.name, 
            MOCK_USER_CREDENTIALS.tier, 
            false // isNotAdmin
        );
      } else if (email && password) { // Allow any other login for demo if not matching specific mocks
         onLoginSuccess(email, "Demo User", "Trial", false);
      }
      else {
        setError('Invalid email or password. Try "hr@example.com"/"password" or "admin@example.com"/"adminpassword".');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 md:p-10">
        <div className="text-center mb-8">
          <SparklesIcon className="w-16 h-16 mx-auto text-blue-600 mb-3" />
          <h1 className="text-3xl font-bold text-gray-800">HR IntelliHub</h1>
          <p className="text-gray-600 mt-1">Welcome! Please sign in to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
            >
              {isLoading ? (
                <LoadingSpinner size={5} />
              ) : (
                <>
                  <LockClosedIcon className="w-5 h-5 mr-2" />
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs text-gray-500">
            Demo Users: <br/>
            Regular: <code className="bg-gray-200 px-1 rounded">hr@example.com</code> / <code className="bg-gray-200 px-1 rounded">password</code><br/>
            Admin: <code className="bg-gray-200 px-1 rounded">admin@example.com</code> / <code className="bg-gray-200 px-1 rounded">adminpassword</code> <br/>
            (Or any other non-empty credentials for a trial user)
        </p>
      </div>
       <footer className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} HR IntelliHub. AI-Powered HR Solutions.
        </footer>
    </div>
  );
};

export default LoginView;