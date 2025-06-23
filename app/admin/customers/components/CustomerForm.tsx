'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

interface Address {
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

interface CustomerFormProps {
  customerId?: string;
  initialData?: any;
}

export default function CustomerForm({ customerId, initialData }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profile_picture_url: '',
    password: '',
    confirm_password: '',
    status: true,
    addresses: [
      {
        address_type: 'Home',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        location_image_url: '',
        is_default: true,
      },
    ],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: '',
        confirm_password: '',
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      status: checked,
    }));
  };

  const handleAddressChange = (index: number, field: keyof Address, value: string | boolean) => {
    setFormData((prev) => {
      const newAddresses = [...prev.addresses];
      newAddresses[index] = {
        ...newAddresses[index],
        [field]: value,
      };
      return {
        ...prev,
        addresses: newAddresses,
      };
    });
  };

  const handleDefaultAddressChange = (index: number) => {
    setFormData((prev) => {
      const newAddresses = prev.addresses.map((addr, i) => ({
        ...addr,
        is_default: i === index,
      }));
      return {
        ...prev,
        addresses: newAddresses,
      };
    });
  };

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          address_type: 'Home',
          line1: '',
          line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
          location_image_url: '',
          is_default: false,
        },
      ],
    }));
  };

  const removeAddress = (index: number) => {
    if (formData.addresses.length === 1) {
      setAlertMessage('At least one address is required');
      setShowAlert(true);
      return;
    }

    setFormData((prev) => {
      const newAddresses = prev.addresses.filter((_, i) => i !== index);
      // If we removed the default address, make the first one default
      if (prev.addresses[index].is_default && newAddresses.length > 0) {
        newAddresses[0].is_default = true;
      }
      return {
        ...prev,
        addresses: newAddresses,
      };
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!customerId && (!formData.password || formData.password !== formData.confirm_password)) {
      setError('Passwords do not match or are empty');
      return false;
    }

    if (formData.addresses.length === 0) {
      setError('At least one address is required');
      return false;
    }

    const hasDefaultAddress = formData.addresses.some((addr) => addr.is_default);
    if (!hasDefaultAddress) {
      setError('Please set a default address');
      return false;
    }

    for (const address of formData.addresses) {
      if (!address.line1 || !address.city || !address.state || !address.postal_code || !address.country) {
        setError('Please fill in all required address fields');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        confirm_password: undefined,
      };

      if (!submitData.password) {
        delete submitData.password;
      }

      const response = await fetch(
        `/api/admin/customers${customerId ? `/${customerId}` : ''}`,
        {
          method: customerId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save customer');
      }

      router.push('/admin/customers');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Customer Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone *</label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Profile Picture URL</label>
            <Input
              name="profile_picture_url"
              value={formData.profile_picture_url}
              onChange={handleInputChange}
            />
          </div>

          {!customerId && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!customerId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                <Input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  required={!customerId}
                />
              </div>
            </>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.status}
              onCheckedChange={handleStatusChange}
            />
            <label>Active</label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Addresses</h2>
            <Button type="button" onClick={addAddress}>
              Add Address
            </Button>
          </div>

          {formData.addresses.map((address, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Address {index + 1}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeAddress(index)}
                  className="text-red-600"
                >
                  Remove
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type *</label>
                <Select
                  value={address.address_type}
                  onValueChange={(value) => handleAddressChange(index, 'address_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                <Input
                  value={address.line1}
                  onChange={(e) => handleAddressChange(index, 'line1', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address Line 2</label>
                <Input
                  value={address.line2}
                  onChange={(e) => handleAddressChange(index, 'line2', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <Input
                    value={address.city}
                    onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <Input
                    value={address.state}
                    onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code *</label>
                  <Input
                    value={address.postal_code}
                    onChange={(e) => handleAddressChange(index, 'postal_code', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Country *</label>
                  <Input
                    value={address.country}
                    onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location Image URL</label>
                <Input
                  value={address.location_image_url}
                  onChange={(e) => handleAddressChange(index, 'location_image_url', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={address.is_default}
                  onCheckedChange={() => handleDefaultAddressChange(index)}
                />
                <label>Default Address</label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-600 mt-4">{error}</div>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/customers')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : customerId ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogTitle>Error</AlertDialogTitle>
          <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          <AlertDialogAction onClick={() => setShowAlert(false)}>OK</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
} 