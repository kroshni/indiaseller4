'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  AddressStep,
  BusinessDetailsStep,
  DocumentsStep,
  GalleryStep,
  PersonalDetailsStep,
  ProductDetailsStep,
  SellerTypeStep,
  ServiceDetailsStep
} from '../../add/components';

interface SellerData {
  name: string;
  email: string;
  phone: string;
  profile_picture_url: string;
  status: boolean;
  kyc_status: boolean;
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

export default function EditSellerPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sellerData, setSellerData] = useState<SellerData | null>(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!params?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/sellers/list/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch seller data');
        const data = await response.json();
        setSellerData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch seller data');
        console.error('Error fetching seller data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [params?.id]);

  const handleSubmit = async () => {
    if (!params?.id) return;
    
    try {
      const response = await fetch(`/api/admin/sellers/list/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sellerData),
      });

      if (!response.ok) throw new Error('Failed to update seller');

      router.push('/admin/sellers');
    } catch (err) {
      console.error('Error updating seller:', err);
      setError(err instanceof Error ? err.message : 'Failed to update seller');
    }
  };

  if (loading) return <div className="p-6">Loading seller data...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!sellerData) return <div className="p-6">Seller not found</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Seller</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Changes
          </button>
          <button
            onClick={() => router.push('/admin/sellers')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {sellerData && (
          <>
            <PersonalDetailsStep
              data={{
                name: sellerData.name || '',
                email: sellerData.email || '',
                phone: sellerData.phone || '',
                profilePictureUrl: sellerData.profile_picture_url || '',
                password: '' // Password is not needed for edit
              }}
              onChange={(data) => {
                setSellerData({
                  ...sellerData,
                  name: data.name,
                  email: data.email,
                  phone: data.phone,
                  profile_picture_url: data.profilePictureUrl
                });
              }}
            />

            <BusinessDetailsStep
              data={{
                companyName: sellerData.business_details?.company_name || '',
                gstin: sellerData.business_details?.gstin || '',
                pan: sellerData.business_details?.pan || '',
                bankName: sellerData.business_details?.bank_name || '',
                accountNumber: sellerData.business_details?.account_number || '',
                ifscCode: sellerData.business_details?.ifsc_code || ''
              }}
              onChange={(data) => {
                setSellerData({
                  ...sellerData,
                  business_details: {
                    ...sellerData.business_details,
                    company_name: data.companyName,
                    gstin: data.gstin,
                    pan: data.pan,
                    bank_name: data.bankName,
                    account_number: data.accountNumber,
                    ifsc_code: data.ifscCode
                  }
                });
              }}
            />

            <SellerTypeStep
              data={{
                isProductSeller: sellerData.seller_type?.is_product_seller || false,
                isServiceSeller: sellerData.seller_type?.is_service_seller || false
              }}
              onChange={(data) => {
                setSellerData({
                  ...sellerData,
                  seller_type: {
                    is_product_seller: data.isProductSeller,
                    is_service_seller: data.isServiceSeller
                  }
                });
              }}
            />

            {sellerData.seller_type?.is_product_seller && sellerData.product_details && (
              <ProductDetailsStep
                data={{
                  categories: sellerData.product_details.categories || [],
                  tags: sellerData.product_details.tags || []
                }}
                onChange={(data) => {
                  setSellerData({
                    ...sellerData,
                    product_details: {
                      categories: data.categories,
                      tags: data.tags
                    }
                  });
                }}
              />
            )}

            {sellerData.seller_type?.is_service_seller && sellerData.service_details && (
              <ServiceDetailsStep
                data={{
                  serviceId: sellerData.service_details.service_id || '',
                  profession: sellerData.service_details.profession || '',
                  description: sellerData.service_details.description || '',
                  yearsExperience: sellerData.service_details.years_experience || 0,
                  availableDays: sellerData.service_details.available_days || [],
                  timingStart: sellerData.service_details.timing_start || '',
                  timingEnd: sellerData.service_details.timing_end || '',
                  pricingType: sellerData.service_details.pricing_type || '',
                  pricingValue: sellerData.service_details.pricing_value || 0,
                  pricingUnit: sellerData.service_details.pricing_unit || '',
                  isOnsite: sellerData.service_details.is_onsite || false,
                  isRemote: sellerData.service_details.is_remote || false,
                  operatingRadius: sellerData.service_details.operating_radius || 0,
                  certifications: sellerData.service_details.certifications.map(cert => ({
                    documentUrl: cert.document_url,
                    documentType: cert.document_type
                  })) || []
                }}
                onChange={(data) => {
                  setSellerData({
                    ...sellerData,
                    service_details: {
                      service_id: data.serviceId,
                      profession: data.profession,
                      description: data.description,
                      years_experience: data.yearsExperience,
                      available_days: data.availableDays,
                      timing_start: data.timingStart,
                      timing_end: data.timingEnd,
                      pricing_type: data.pricingType,
                      pricing_value: data.pricingValue,
                      pricing_unit: data.pricingUnit,
                      is_onsite: data.isOnsite,
                      is_remote: data.isRemote,
                      operating_radius: data.operatingRadius,
                      certifications: data.certifications.map(cert => ({
                        document_url: cert.documentUrl,
                        document_type: cert.documentType
                      }))
                    }
                  });
                }}
              />
            )}

            <AddressStep
              data={sellerData.addresses.map(addr => ({
                addressId: addr.address_id,
                addressType: addr.address_type,
                line1: addr.line1,
                line2: addr.line2,
                city: addr.city,
                state: addr.state,
                postalCode: addr.postal_code,
                country: addr.country,
                locationImageUrl: addr.location_image_url,
                isDefault: addr.is_default
              })) || []}
              onChange={(addresses) => {
                setSellerData({
                  ...sellerData,
                  addresses: addresses.map(addr => ({
                    address_id: addr.addressId,
                    address_type: addr.addressType,
                    line1: addr.line1,
                    line2: addr.line2,
                    city: addr.city,
                    state: addr.state,
                    postal_code: addr.postalCode,
                    country: addr.country,
                    location_image_url: addr.locationImageUrl,
                    is_default: addr.isDefault
                  }))
                });
              }}
            />

            <DocumentsStep
              data={sellerData.documents.map(doc => ({
                documentType: doc.document_type,
                documentUrl: doc.document_url
              })) || []}
              onChange={(documents) => {
                setSellerData({
                  ...sellerData,
                  documents: documents.map(doc => ({
                    document_type: doc.documentType,
                    document_url: doc.documentUrl
                  }))
                });
              }}
            />

            <GalleryStep
              data={sellerData.gallery.map(img => ({
                imageId: img.image_id,
                imageUrl: img.image_url,
                caption: img.caption
              })) || []}
              onChange={(gallery) => {
                setSellerData({
                  ...sellerData,
                  gallery: gallery.map(img => ({
                    image_id: img.imageId,
                    image_url: img.imageUrl,
                    caption: img.caption
                  }))
                });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
} 