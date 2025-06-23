'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Address {
  address_id: string;
  address_type: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface Document {
  document_id: string;
  document_type: string;
  document_url: string;
  status: string;
}

interface SellerProfile {
  seller_id: string;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  business_type: string;
  gst_number?: string;
  pan_number?: string;
  status: boolean;
  kyc_status: string;
  product_categories?: string[];
  service_categories?: string[];
  addresses: Address[];
  documents: Document[];
  gallery_images: string[];
  created_at: string;
  updated_at: string;
}

export default function SellerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<SellerProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/seller/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">No profile data found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seller Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage your seller profile information
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="business">Business Details</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      profile.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {profile.status ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Business Name</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.business_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Business Type</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.business_type}</p>
              </div>
              {profile.gst_number && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">GST Number</h3>
                  <p className="mt-1 text-sm text-gray-900">{profile.gst_number}</p>
                </div>
              )}
              {profile.pan_number && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">PAN Number</h3>
                  <p className="mt-1 text-sm text-gray-900">{profile.pan_number}</p>
                </div>
              )}
            </div>
          </Card>

          {profile.product_categories && profile.product_categories.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Product Categories</h3>
              <div className="flex flex-wrap gap-2">
                {profile.product_categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {profile.service_categories && profile.service_categories.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Service Categories</h3>
              <div className="flex flex-wrap gap-2">
                {profile.service_categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="space-y-6">
          {profile.addresses.map((address) => (
            <Card key={address.address_id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {address.address_type}
                    {address.is_default && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                  </h3>
                  <div className="mt-2 text-sm text-gray-500 space-y-1">
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p>{address.country}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          {profile.documents.map((document) => (
            <Card key={document.document_id} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {document.document_type}
                  </h3>
                  <p className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        document.status === 'Verified'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {document.status}
                    </span>
                  </p>
                </div>
                <a
                  href={document.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Document
                </a>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.gallery_images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 