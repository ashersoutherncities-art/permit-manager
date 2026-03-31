'use client';

import { useAuth } from './AuthContext';
import GoogleLogin from './GoogleLogin';
import { User } from '../auth';

export default function LoginPage() {
  const { login } = useAuth();

  const handleLoginSuccess = (user: User) => {
    login(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Permit Manager</h1>
            <p className="text-gray-600">Track permits, inspections, and project compliance</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sign in to your account
              </label>
              <GoogleLogin onSuccess={handleLoginSuccess} />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue as guest</span>
              </div>
            </div>

            <button
              onClick={() => {
                // Continue as guest with a temporary user
                const guestUser: User = {
                  id: 'guest-' + Date.now(),
                  email: 'guest@example.com',
                  name: 'Guest User',
                  createdAt: new Date().toISOString(),
                };
                handleLoginSuccess(guestUser);
              }}
              className="w-full px-4 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue as Guest
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Each user has separate data:</span> Your projects, permits, and documents are stored separately per authenticated account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
