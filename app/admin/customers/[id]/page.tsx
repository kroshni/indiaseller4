'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Address {
  address_id: string;
  address_type: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  location_image_url?: string;
  is_default: boolean;
}

interface Customer {
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  profile_picture_url?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export default function ViewCustomerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/admin/customers/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch customer');
        }
        const data = await response.json();
        setCustomer(data.customer);
        setAddresses(data.addresses);
      } catch (error) {
        setError('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      router.push('/admin/customers');
    } catch (error) {
      setError('Failed to delete customer');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!customer) {
    return <div className="p-6">Customer not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Details</h1>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/customers')}
          >
            Back to List
          </Button>
          <Button
            onClick={() => router.push(`/admin/customers/edit/${id}`)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            
            {customer.profile_picture_url && (
              <div className="mb-4">
                <img
                  src={customer.profile_picture_url}
                  alt={customer.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="font-medium">Name</label>
                <p>{customer.name}</p>
              </div>

              <div>
                <label className="font-medium">Email</label>
                <p>{customer.email}</p>
              </div>

              <div>
                <label className="font-medium">Phone</label>
                <p>{customer.phone}</p>
              </div>

              <div>
                <label className="font-medium">Status</label>
                <p className={customer.status ? 'text-green-600' : 'text-red-600'}>
                  {customer.status ? 'Active' : 'Inactive'}
                </p>
              </div>

              <div>
                <label className="font-medium">Created At</label>
                <p>{new Date(customer.created_at).toLocaleString()}</p>
              </div>

              <div>
                <label className="font-medium">Last Updated</label>
                <p>{new Date(customer.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Addresses</h2>
            
            <div className="space-y-6">
              {addresses.map((address) => (
                <div
                  key={address.address_id}
                  className={`border rounded-lg p-4 ${
                    address.is_default ? 'border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{address.address_type}</span>
                      {address.is_default && (
                        <span className="ml-2 text-sm text-blue-600">
                          (Default)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p>{address.country}</p>
                  </div>

                  {address.location_image_url && (
                    <div className="mt-4">
                      <img
                        src={address.location_image_url}
                        alt="Location"
                        className="w-full h-40 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 