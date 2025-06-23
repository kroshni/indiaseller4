'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

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
  location_image_url?: string;
}

interface Document {
  document_id: string;
  document_type: string;
  document_url: string;
  status: string;
}

interface Service {
  service_id: string;
  profession: string;
  description: string;
  years_experience: number;
  available_days: string[];
  timing_start: string;
  timing_end: string;
  pricing_type: string;
  pricing_value: number;
  pricing_unit: string;
  is_onsite: boolean;
  is_remote: boolean;
  operating_radius: number;
}

interface SellerProfile {
  seller_id: string;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  gst_number?: string;
  pan_number?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  status: boolean;
  kyc_status: string;
  profile_picture_url?: string;
  is_product_seller: boolean;
  is_service_seller: boolean;
  product_categories: string[];
  services: Service[];
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
        setLoading(true);
        const response = await fetch('/api/seller/profile');
        const data = await response.json();
        
        console.log('Profile API Response:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }

        // Ensure all array fields have default values
        const normalizedData = {
          ...data,
          addresses: data.addresses || [],
          documents: data.documents || [],
          gallery_images: data.gallery_images || [],
          product_categories: data.product_categories || [],
          services: data.services || []
        };

        console.log('Normalized Profile Data:', normalizedData);
        setProfile(normalizedData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Debug output
  useEffect(() => {
    if (profile) {
      console.log('Current Profile State:', {
        name: profile.name,
        email: profile.email,
        business: profile.business_name,
        categories: {
          products: profile.product_categories,
          services: profile.services.map(service => service.profession)
        },
        addresses: profile.addresses,
        documents: profile.documents,
        gallery: profile.gallery_images
      });
    }
  }, [profile]);

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
        <TabsList className="grid w-full grid-cols-5">
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
                <p className="mt-1 text-sm text-gray-900">{profile.name || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.email || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.phone || 'N/A'}</p>
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
              <div>
                <h3 className="text-sm font-medium text-gray-500">KYC Status</h3>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      profile.kyc_status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {profile.kyc_status || 'Pending'}
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
                <p className="mt-1 text-sm text-gray-900">{profile.business_name || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Business Type</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {[
                    profile.is_product_seller && 'Product Seller',
                    profile.is_service_seller && 'Service Provider'
                  ].filter(Boolean).join(', ') || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">GST Number</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.gst_number || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">PAN Number</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.pan_number || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Bank Details */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Bank Details</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Bank Name</h4>
                <p className="mt-1 text-sm text-gray-900">{profile.bank_name || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Account Number</h4>
                <p className="mt-1 text-sm text-gray-900">{profile.account_number || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">IFSC Code</h4>
                <p className="mt-1 text-sm text-gray-900">{profile.ifsc_code || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Product Categories */}
          {profile.is_product_seller && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Product Categories</h3>
              <div className="flex flex-wrap gap-2">
                {profile.product_categories && profile.product_categories.length > 0 ? (
                  profile.product_categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {category}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No product categories selected</p>
                )}
              </div>
            </Card>
          )}

          {/* Services */}
          {profile.is_service_seller && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Services</h3>
              <div className="space-y-6">
                {profile.services && profile.services.length > 0 ? (
                  profile.services.map((service) => (
                    <div key={service.service_id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Profession</h4>
                          <p className="mt-1 text-sm text-gray-900">{service.profession}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Experience</h4>
                          <p className="mt-1 text-sm text-gray-900">{service.years_experience} years</p>
                        </div>
                        <div className="sm:col-span-2">
                          <h4 className="text-sm font-medium text-gray-500">Description</h4>
                          <p className="mt-1 text-sm text-gray-900">{service.description}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Available Days</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {service.available_days.join(', ')}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Timing</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {service.timing_start} - {service.timing_end}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Pricing</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {service.pricing_value} {service.pricing_unit} ({service.pricing_type})
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Service Type</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {[
                              service.is_onsite && 'On-site',
                              service.is_remote && 'Remote'
                            ].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        {service.is_onsite && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Operating Radius</h4>
                            <p className="mt-1 text-sm text-gray-900">{service.operating_radius} km</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No services added</p>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="space-y-6">
          {profile.addresses && profile.addresses.length > 0 ? (
            profile.addresses.map((address) => (
              <Card key={address.address_id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {address.address_type}
                      </h3>
                      {address.is_default && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {[
                        address.line1,
                        address.line2,
                        address.city,
                        address.state,
                        address.postal_code,
                        address.country
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  {address.location_image_url && (
                    <div className="ml-4">
                      <Image
                        src={address.location_image_url}
                        alt="Location"
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6">
              <p className="text-sm text-gray-500">No addresses added</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="p-6">
            {profile.documents && profile.documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {profile.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Image
                        src="/file.svg"
                        alt="Document"
                        width={24}
                        height={24}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {doc.document_type}
                      </h4>
                      <a
                        href={doc.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 truncate"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents uploaded</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card className="p-6">
            {profile.gallery_images && profile.gallery_images.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {profile.gallery_images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No gallery images uploaded</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 