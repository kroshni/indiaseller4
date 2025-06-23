'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface EditSellerProps {
  params: {
    id: string;
  };
}

export default function EditSellerPage({ params }: EditSellerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sellerData, setSellerData] = useState(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
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
  }, [params.id]);

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch(`/api/admin/sellers/list/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
        <button
          onClick={() => router.push('/admin/sellers')}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Back to List
        </button>
      </div>

      <div className="space-y-8">
        <PersonalDetailsStep
          initialData={{
            name: sellerData.name,
            email: sellerData.email,
            phone: sellerData.phone,
            profile_picture_url: sellerData.profile_picture_url,
            status: sellerData.status,
            kyc_status: sellerData.kyc_status
          }}
          onSubmit={handleSubmit}
        />

        <BusinessDetailsStep
          initialData={sellerData.business_details}
          onSubmit={handleSubmit}
        />

        <SellerTypeStep
          initialData={sellerData.seller_type}
          onSubmit={handleSubmit}
        />

        {sellerData.seller_type.is_product_seller && (
          <ProductDetailsStep
            initialData={sellerData.product_details}
            onSubmit={handleSubmit}
          />
        )}

        {sellerData.seller_type.is_service_seller && (
          <ServiceDetailsStep
            initialData={sellerData.service_details}
            onSubmit={handleSubmit}
          />
        )}

        <AddressStep
          initialData={sellerData.addresses}
          onSubmit={handleSubmit}
        />

        <DocumentsStep
          initialData={sellerData.documents}
          onSubmit={handleSubmit}
        />

        <GalleryStep
          initialData={sellerData.gallery}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
} 