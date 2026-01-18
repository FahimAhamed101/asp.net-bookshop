'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLogoutMutation } from '@/redux/features/auth/authApi';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [logout, { isLoading }] = useLogoutMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Medical App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.firstName}!</span>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* User Info Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">User Information</h3>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                <p><strong>Role:</strong> {user?.role}</p>
                <p><strong>Verified:</strong> {user?.isVerified ? 'Yes' : 'No'}</p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/dashboard"
                    className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </Link>
                  <button className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    Book Appointment
                  </button>
                  <button className="block w-full text-center bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                    View Doctors
                  </button>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Account Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Onboarding Step:</span>
                    <span className="font-semibold">{user?.onboardingStep || 'Not started'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profile Completion:</span>
                    <span className="font-semibold">
                      {user?.personalInfo ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance Info:</span>
                    <span className="font-semibold">
                      {user?.insuranceInfo?.length > 0 ? 'Added' : 'Not added'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-gray-600 mb-4">
                {user?.onboardingStep === 0 
                  ? 'Start your onboarding process to access all features.'
                  : `You're on step ${user?.onboardingStep} of the onboarding process.`}
              </p>
              <Link
                href="/dashboard/profile"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}