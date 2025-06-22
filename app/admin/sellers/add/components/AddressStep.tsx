'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Address {
  addressId: string;
  addressType: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  locationImageUrl: string;
  isDefault: boolean;
}

interface AddressStepProps {
  data: Address[];
  onChange: (data: Address[]) => void;
}

const ADDRESS_TYPES = [
  'Business',
  'Warehouse',
  'Store',
  'Office',
  'Factory',
  'Other'
];

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Other'
];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const emptyAddress: Address = {
  addressId: '',
  addressType: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  locationImageUrl: '',
  isDefault: false
};

export default function AddressStep({ data, onChange }: AddressStepProps) {
  const [newAddress, setNewAddress] = useState<Address>({
    ...emptyAddress,
    addressId: uuidv4()
  });

  const handleAddAddress = () => {
    if (
      newAddress.addressType &&
      newAddress.line1 &&
      newAddress.city &&
      newAddress.state &&
      newAddress.postalCode &&
      newAddress.country
    ) {
      // If this is the first address, make it default
      if (data.length === 0) {
        newAddress.isDefault = true;
      }
      onChange([...data, newAddress]);
      setNewAddress({ ...emptyAddress, addressId: uuidv4() });
    }
  };

  const handleRemoveAddress = (addressId: string) => {
    const removedAddress = data.find((addr) => addr.addressId === addressId);
    const newAddresses = data.filter((addr) => addr.addressId !== addressId);

    // If we removed the default address and there are other addresses,
    // make the first one default
    if (removedAddress?.isDefault && newAddresses.length > 0) {
      newAddresses[0].isDefault = true;
    }

    onChange(newAddresses);
  };

  const handleSetDefault = (addressId: string) => {
    onChange(
      data.map((addr) => ({
        ...addr,
        isDefault: addr.addressId === addressId
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Business Address</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add your business locations.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label
              htmlFor="address-type"
              className="block text-sm font-medium text-gray-700"
            >
              Address Type
            </label>
            <div className="mt-1">
              <select
                id="address-type"
                value={newAddress.addressType}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, addressType: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select type</option>
                {ADDRESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="line1"
              className="block text-sm font-medium text-gray-700"
            >
              Address Line 1
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="line1"
                value={newAddress.line1}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, line1: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="line2"
              className="block text-sm font-medium text-gray-700"
            >
              Address Line 2
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="line2"
                value={newAddress.line2}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, line2: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              City
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="city"
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700"
            >
              State
            </label>
            <div className="mt-1">
              <select
                id="state"
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="postal-code"
              className="block text-sm font-medium text-gray-700"
            >
              Postal Code
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="postal-code"
                value={newAddress.postalCode}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, postalCode: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <div className="mt-1">
              <select
                id="country"
                value={newAddress.country}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, country: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="location-image"
              className="block text-sm font-medium text-gray-700"
            >
              Location Image URL
            </label>
            <div className="mt-1">
              <input
                type="url"
                id="location-image"
                value={newAddress.locationImageUrl}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    locationImageUrl: e.target.value
                  })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="https://"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <button
              type="button"
              onClick={handleAddAddress}
              disabled={
                !newAddress.addressType ||
                !newAddress.line1 ||
                !newAddress.city ||
                !newAddress.state ||
                !newAddress.postalCode ||
                !newAddress.country
              }
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Add Address
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {data.map((address) => (
            <div
              key={address.addressId}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{address.addressType}</span>
                  {address.isDefault && (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address.addressId)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveAddress(address.addressId)}
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p>{address.country}</p>
              </div>
              {address.locationImageUrl && (
                <div className="mt-2">
                  <img
                    src={address.locationImageUrl}
                    alt="Location"
                    className="h-32 w-full rounded-md object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/400x200?text=Location+Image';
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <p className="text-sm text-gray-500">No addresses added yet.</p>
        )}
      </div>
    </div>
  );
} 