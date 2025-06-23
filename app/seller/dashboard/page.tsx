'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SellerData {
  name: string;
  business_name: string;
  status: boolean;
  kyc_status: 'Verified' | 'Pending';
  email: string;
  phone: string;
}

export default function SellerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sellerData, setSellerData] = useState<SellerData | null>(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const response = await fetch('/api/seller/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch seller data');
        }
        const data = await response.json();
        setSellerData(data);
      } catch (error) {
        console.error('Error fetching seller data:', error);
        setError('Failed to load seller information');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!sellerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">No seller data found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {sellerData.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's an overview of your seller account
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Business Name</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-gray-900">
              {sellerData.business_name}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  sellerData.status
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {sellerData.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">KYC Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  sellerData.kyc_status === 'Verified'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {sellerData.kyc_status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-sm text-gray-900">{sellerData.email}</p>
              <p className="text-sm text-gray-900">{sellerData.phone}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 