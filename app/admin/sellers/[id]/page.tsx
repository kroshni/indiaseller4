'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';

interface SellerDetails {
  seller_id: string;
  name: string;
  email: string;
  phone: string;
  profile_picture_url: string;
  status: boolean;
  kyc_status: boolean;
  created_at: string;
  business_details: {
    company_name: string;
    gstin: string;
    pan: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
  };
  seller_type: {
    is_product_seller: boolean;
    is_service_seller: boolean;
  };
  product_details?: {
    categories: string[];
    tags: string[];
  };
  service_details?: {
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
    certifications: Array<{
      document_url: string;
      document_type: string;
    }>;
  };
  addresses: Array<{
    address_id: string;
    address_type: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    location_image_url: string;
    is_default: boolean;
  }>;
  documents: Array<{
    document_type: string;
    document_url: string;
  }>;
  gallery: Array<{
    image_id: string;
    image_url: string;
    caption: string;
  }>;
}

export default function ViewSellerPage() {
  const router = useRouter();
  const params = useParams();
  const [seller, setSeller] = useState<SellerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        const response = await fetch(`/api/admin/sellers/list/${params?.id}`);
        if (!response.ok) throw new Error('Failed to fetch seller details');
        const data = await response.json();
        setSeller(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch seller details');
        console.error('Error fetching seller details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchSellerDetails();
    }
  }, [params?.id]);

  if (loading) return <div className="p-6">Loading seller details...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!seller) return <div className="p-6">Seller not found</div>;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Seller Details</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/sellers/${params?.id}/edit`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit Seller
          </button>
          <button
            onClick={() => router.push('/admin/sellers')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 rounded-full overflow-hidden">
              <Image
                src={seller.profile_picture_url || 'https://via.placeholder.com/96'}
                alt={seller.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium">{seller.name}</h3>
              <p className="text-gray-600">{seller.email}</p>
              <p className="text-gray-600">{seller.phone}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              {seller.status ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle2Icon className="h-5 w-5 mr-1" /> Active
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <XCircleIcon className="h-5 w-5 mr-1" /> Inactive
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">KYC Status:</span>
              {seller.kyc_status ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle2Icon className="h-5 w-5 mr-1" /> Verified
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <XCircleIcon className="h-5 w-5 mr-1" /> Not Verified
                </span>
              )}
            </div>
            <div>
              <span className="font-medium">Member Since:</span>{' '}
              {new Date(seller.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </section>

      {/* Business Information */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p><span className="font-medium">Company Name:</span> {seller.business_details.company_name}</p>
            <p><span className="font-medium">GSTIN:</span> {seller.business_details.gstin}</p>
            <p><span className="font-medium">PAN:</span> {seller.business_details.pan}</p>
          </div>
          <div>
            <p><span className="font-medium">Bank Name:</span> {seller.business_details.bank_name}</p>
            <p><span className="font-medium">Account Number:</span> {seller.business_details.account_number}</p>
            <p><span className="font-medium">IFSC Code:</span> {seller.business_details.ifsc_code}</p>
          </div>
        </div>
      </section>

      {/* Seller Type */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Seller Type</h2>
        <div className="flex gap-4">
          {seller.seller_type.is_product_seller && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">Product Seller</span>
          )}
          {seller.seller_type.is_service_seller && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">Service Provider</span>
          )}
        </div>
      </section>

      {/* Product Details */}
      {seller.seller_type.is_product_seller && seller.product_details && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Product Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {seller.product_details.categories.map((category, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 rounded-full">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {seller.product_details.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Service Details */}
      {seller.seller_type.is_service_seller && seller.service_details && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Service Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p><span className="font-medium">Profession:</span> {seller.service_details.profession}</p>
              <p><span className="font-medium">Experience:</span> {seller.service_details.years_experience} years</p>
              <p><span className="font-medium">Service Type:</span>{' '}
                {[
                  seller.service_details.is_onsite && 'On-site',
                  seller.service_details.is_remote && 'Remote'
                ].filter(Boolean).join(', ')}
              </p>
              {seller.service_details.is_onsite && (
                <p><span className="font-medium">Operating Radius:</span> {seller.service_details.operating_radius} km</p>
              )}
            </div>
            <div>
              <p><span className="font-medium">Available Days:</span> {seller.service_details.available_days.join(', ')}</p>
              <p><span className="font-medium">Timing:</span> {seller.service_details.timing_start} - {seller.service_details.timing_end}</p>
              <p>
                <span className="font-medium">Pricing:</span>{' '}
                {seller.service_details.pricing_value} {seller.service_details.pricing_unit} ({seller.service_details.pricing_type})
              </p>
            </div>
            <div className="col-span-2">
              <p className="font-medium">Description:</p>
              <p className="mt-1">{seller.service_details.description}</p>
            </div>
            {seller.service_details.certifications.length > 0 && (
              <div className="col-span-2">
                <h3 className="font-medium mb-2">Certifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {seller.service_details.certifications.map((cert, index) => (
                    <a
                      key={index}
                      href={cert.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <p className="text-sm font-medium">{cert.document_type}</p>
                      <p className="text-sm text-blue-600">View Document</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Addresses */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Addresses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {seller.addresses.map((address) => (
            <div key={address.address_id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{address.address_type}</span>
                {address.is_default && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">Default</span>
                )}
              </div>
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>{address.city}, {address.state} {address.postal_code}</p>
              <p>{address.country}</p>
              {address.location_image_url && (
                <div className="mt-2 relative h-40 w-full rounded-lg overflow-hidden">
                  <Image
                    src={address.location_image_url}
                    alt="Location"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Documents */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {seller.documents.map((doc, index) => (
            <a
              key={index}
              href={doc.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border rounded-lg hover:bg-gray-50"
            >
              <p className="font-medium">{doc.document_type}</p>
              <p className="text-sm text-blue-600">View Document</p>
            </a>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {seller.gallery.map((item) => (
            <div key={item.image_id} className="relative aspect-square rounded-lg overflow-hidden group">
              <Image
                src={item.image_url}
                alt={item.caption}
                fill
                className="object-cover"
              />
              {item.caption && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-white text-sm">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 