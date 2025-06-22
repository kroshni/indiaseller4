'use client';

import { useEffect, useState } from 'react';

interface Service {
  id: string;
  name: string;
}

interface ServiceDetailsData {
  profession: string;
  serviceId: string;
  description: string;
  yearsExperience: number;
  availableDays: string[];
  timingStart: string;
  timingEnd: string;
  pricingType: string;
  pricingValue: number;
  pricingUnit: string;
  isOnsite: boolean;
  isRemote: boolean;
  operatingRadius: number;
  certifications: Array<{
    documentUrl: string;
    documentType: string;
  }>;
}

interface ServiceDetailsStepProps {
  data: ServiceDetailsData;
  onChange: (data: ServiceDetailsData) => void;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const PRICING_TYPES = [
  { id: 'fixed', name: 'Fixed Price' },
  { id: 'variable', name: 'Variable Price' }
];

const PRICING_UNITS = [
  { id: 'per_session', name: 'Per Session' },
  { id: 'per_hour', name: 'Per Hour' },
  { id: 'per_visit', name: 'Per Visit' }
];

export default function ServiceDetailsStep({
  data,
  onChange
}: ServiceDetailsStepProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCertification, setNewCertification] = useState({
    documentUrl: '',
    documentType: ''
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/admin/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const result = await response.json();
        // Transform the services data to match the expected format
        const transformedServices = result.services.map((service: any) => ({
          id: service.service_id,
          name: service.service_name
        }));
        setServices(transformedServices);
      } catch (err) {
        setError('Failed to load services');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (field: keyof ServiceDetailsData, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleDayToggle = (day: string) => {
    const newDays = data.availableDays.includes(day)
      ? data.availableDays.filter((d) => d !== day)
      : [...data.availableDays, day];
    handleChange('availableDays', newDays);
  };

  const handleAddCertification = () => {
    if (newCertification.documentUrl && newCertification.documentType) {
      handleChange('certifications', [
        ...data.certifications,
        { ...newCertification }
      ]);
      setNewCertification({ documentUrl: '', documentType: '' });
    }
  };

  const handleRemoveCertification = (index: number) => {
    handleChange(
      'certifications',
      data.certifications.filter((_, i) => i !== index)
    );
  };

  if (loading) {
    return <div>Loading services...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Service Details</h2>
        <p className="mt-1 text-sm text-gray-500">
          Provide details about your service offering.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label
            htmlFor="profession"
            className="block text-sm font-medium text-gray-700"
          >
            Profession
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="profession"
              id="profession"
              value={data.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="service"
            className="block text-sm font-medium text-gray-700"
          >
            Service Type
          </label>
          <div className="mt-1">
            <select
              id="service"
              name="service"
              value={data.serviceId}
              onChange={(e) => handleChange('serviceId', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Service Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={4}
              value={data.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="years-experience"
            className="block text-sm font-medium text-gray-700"
          >
            Years of Experience
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="years-experience"
              id="years-experience"
              min="0"
              value={data.yearsExperience}
              onChange={(e) =>
                handleChange('yearsExperience', parseInt(e.target.value) || 0)
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-gray-700">
            Available Days
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-7">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="flex items-center">
                <input
                  type="checkbox"
                  id={`day-${day}`}
                  checked={data.availableDays.includes(day)}
                  onChange={() => handleDayToggle(day)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`day-${day}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {day}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="timing-start"
            className="block text-sm font-medium text-gray-700"
          >
            Start Time
          </label>
          <div className="mt-1">
            <input
              type="time"
              name="timing-start"
              id="timing-start"
              value={data.timingStart}
              onChange={(e) => handleChange('timingStart', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="timing-end"
            className="block text-sm font-medium text-gray-700"
          >
            End Time
          </label>
          <div className="mt-1">
            <input
              type="time"
              name="timing-end"
              id="timing-end"
              value={data.timingEnd}
              onChange={(e) => handleChange('timingEnd', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="pricing-type"
            className="block text-sm font-medium text-gray-700"
          >
            Pricing Type
          </label>
          <div className="mt-1">
            <select
              id="pricing-type"
              name="pricing-type"
              value={data.pricingType}
              onChange={(e) => handleChange('pricingType', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select pricing type</option>
              {PRICING_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="pricing-value"
            className="block text-sm font-medium text-gray-700"
          >
            Price
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="pricing-value"
              id="pricing-value"
              min="0"
              step="0.01"
              value={data.pricingValue}
              onChange={(e) =>
                handleChange('pricingValue', parseFloat(e.target.value) || 0)
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="pricing-unit"
            className="block text-sm font-medium text-gray-700"
          >
            Price Unit
          </label>
          <div className="mt-1">
            <select
              id="pricing-unit"
              name="pricing-unit"
              value={data.pricingUnit}
              onChange={(e) => handleChange('pricingUnit', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select unit</option>
              {PRICING_UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-gray-700">
            Service Mode
          </label>
          <div className="mt-2 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="onsite"
                checked={data.isOnsite}
                onChange={(e) => handleChange('isOnsite', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="onsite" className="ml-2 text-sm text-gray-700">
                On-Site Service
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remote"
                checked={data.isRemote}
                onChange={(e) => handleChange('isRemote', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remote" className="ml-2 text-sm text-gray-700">
                Remote Service
              </label>
            </div>
          </div>
        </div>

        {data.isOnsite && (
          <div className="sm:col-span-4">
            <label
              htmlFor="operating-radius"
              className="block text-sm font-medium text-gray-700"
            >
              Operating Radius (km)
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="operating-radius"
                id="operating-radius"
                min="0"
                value={data.operatingRadius}
                onChange={(e) =>
                  handleChange('operatingRadius', parseInt(e.target.value) || 0)
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        <div className="sm:col-span-6">
          <label className="block text-sm font-medium text-gray-700">
            Service Certifications
          </label>
          <div className="mt-2 space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Document Type"
                value={newCertification.documentType}
                onChange={(e) =>
                  setNewCertification({
                    ...newCertification,
                    documentType: e.target.value
                  })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <input
                type="url"
                placeholder="Document URL"
                value={newCertification.documentUrl}
                onChange={(e) =>
                  setNewCertification({
                    ...newCertification,
                    documentUrl: e.target.value
                  })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleAddCertification}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {data.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                >
                  <div>
                    <p className="font-medium">{cert.documentType}</p>
                    <p className="text-sm text-gray-500">{cert.documentUrl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 