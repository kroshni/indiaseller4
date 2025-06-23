'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CustomerForm from '../../components/CustomerForm';

export default function EditCustomerPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/admin/customers/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch customer');
        }
        const data = await response.json();
        setCustomer({
          ...data.customer,
          addresses: data.addresses,
        });
      } catch (error) {
        setError('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Customer</h1>
      <CustomerForm customerId={id as string} initialData={customer} />
    </div>
  );
} 