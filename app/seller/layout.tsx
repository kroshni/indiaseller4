'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/seller/dashboard', icon: HomeIcon },
  { name: 'Profile', href: '/seller/profile', icon: UserIcon },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/seller/check-auth');
        if (!response.ok && pathname !== '/seller/login') {
          router.push('/seller/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (pathname !== '/seller/login') {
          router.push('/seller/login');
        }
      }
    };
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seller/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/seller/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show navigation on login page
  if (pathname === '/seller/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition duration-200 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4">
            <div className="text-xl font-bold text-gray-800">Seller Panel</div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 flex-shrink-0 ${
                        isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout button */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          {/* Sidebar header */}
          <div className="flex h-16 flex-shrink-0 items-center px-4">
            <div className="text-xl font-bold text-gray-800">Seller Panel</div>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-4 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 flex-shrink-0 ${
                        isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout button */}
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 