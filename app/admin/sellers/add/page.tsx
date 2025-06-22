'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import SellerTypeStep from './components/SellerTypeStep';
import PersonalDetailsStep from './components/PersonalDetailsStep';
import BusinessDetailsStep from './components/BusinessDetailsStep';
import ProductDetailsStep from './components/ProductDetailsStep';
import ServiceDetailsStep from './components/ServiceDetailsStep';
import DocumentsStep from './components/DocumentsStep';
import AddressStep from './components/AddressStep';
import GalleryStep from './components/GalleryStep';

interface FormData {
  sellerId: string;
  sellerType: {
    isProductSeller: boolean;
    isServiceSeller: boolean;
  };
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    profilePictureUrl: string;
    password: string;
  };
  businessDetails: {
    companyName: string;
    gstin: string;
    pan: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };
  productDetails?: {
    categories: string[];
    tags: string[];
  };
  serviceDetails?: {
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
  };
  documents: Array<{
    documentType: string;
    documentUrl: string;
  }>;
  addresses: Array<{
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
  }>;
  gallery: Array<{
    imageId: string;
    imageUrl: string;
    caption: string;
  }>;
}

const STEPS = [
  { id: 'seller-type', title: 'Seller Type' },
  { id: 'personal-details', title: 'Personal Details' },
  { id: 'business-details', title: 'Business Details' },
  { id: 'product-details', title: 'Product Details' },
  { id: 'service-details', title: 'Service Details' },
  { id: 'documents', title: 'Documents' },
  { id: 'address', title: 'Address' },
  { id: 'gallery', title: 'Gallery' }
];

export default function AddSellerPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    sellerId: uuidv4(),
    sellerType: {
      isProductSeller: false,
      isServiceSeller: false
    },
    personalDetails: {
      name: '',
      email: '',
      phone: '',
      profilePictureUrl: '',
      password: ''
    },
    businessDetails: {
      companyName: '',
      gstin: '',
      pan: '',
      bankName: '',
      accountNumber: '',
      ifscCode: ''
    },
    productDetails: {
      categories: [],
      tags: []
    },
    serviceDetails: {
      profession: '',
      serviceId: '',
      description: '',
      yearsExperience: 0,
      availableDays: [],
      timingStart: '',
      timingEnd: '',
      pricingType: '',
      pricingValue: 0,
      pricingUnit: '',
      isOnsite: false,
      isRemote: false,
      operatingRadius: 0,
      certifications: []
    },
    documents: [],
    addresses: [],
    gallery: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      // Remove unused details based on seller type
      const submitData = { ...formData };
      if (!submitData.sellerType.isProductSeller) {
        delete submitData.productDetails;
      }
      if (!submitData.sellerType.isServiceSeller) {
        delete submitData.serviceDetails;
      }

      const response = await fetch('/api/admin/sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        throw new Error('Failed to create seller');
      }

      router.push('/admin/sellers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create seller');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'seller-type':
        return (
          <SellerTypeStep
            data={formData.sellerType}
            onChange={(data) =>
              setFormData((prev) => ({ ...prev, sellerType: data }))
            }
          />
        );
      case 'personal-details':
        return (
          <PersonalDetailsStep
            data={formData.personalDetails}
            onChange={(data) =>
              setFormData((prev) => ({ ...prev, personalDetails: data }))
            }
          />
        );
      case 'business-details':
        return (
          <BusinessDetailsStep
            data={formData.businessDetails}
            onChange={(data) =>
              setFormData((prev) => ({ ...prev, businessDetails: data }))
            }
          />
        );
      case 'product-details':
        if (!formData.sellerType.isProductSeller) return null;
        return (
          <ProductDetailsStep
            data={formData.productDetails!}
            onChange={(data) =>
              setFormData((prev) => ({ ...prev, productDetails: data }))
            }
          />
        );
      case 'service-details':
        if (!formData.sellerType.isServiceSeller) return null;
        return (
          <ServiceDetailsStep
            data={formData.serviceDetails!}
            onChange={(data) =>
              setFormData((prev) => ({ ...prev, serviceDetails: data }))
            }
          />
        );
      case 'documents':
        return (
          <DocumentsStep
            data={formData.documents}
            onChange={(data) =>
              setFormData((prev) => ({ ...prev, documents: data }))
            }
          />
        );
      case 'address':
        return (
          <AddressStep
            data={formData.addresses}
            onChange={(data) =>
              setFormData((prev) => ({ ...prev, addresses: data }))
            }
          />
        );
      case 'gallery':
        return (
          <GalleryStep
            data={formData.gallery}
            onChange={(data) =>
              setFormData((prev) => ({ ...prev, gallery: data }))
            }
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const filteredSteps = STEPS.filter((step) => {
    if (step.id === 'product-details') {
      return formData.sellerType.isProductSeller;
    }
    if (step.id === 'service-details') {
      return formData.sellerType.isServiceSeller;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Seller</h1>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details to add a new seller to the platform.
            </p>
          </div>

          {/* Progress Steps */}
          <nav aria-label="Progress">
            <ol
              role="list"
              className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0"
            >
              {filteredSteps.map((step, index) => (
                <li key={step.title} className="relative md:flex md:flex-1">
                  <button
                    type="button"
                    onClick={() => handleStepClick(index)}
                    className={`group flex w-full items-center ${
                      index !== filteredSteps.length - 1
                        ? 'md:pr-4'
                        : ''
                    }`}
                  >
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                          index < currentStep
                            ? 'bg-indigo-600'
                            : index === currentStep
                            ? 'border-2 border-indigo-600'
                            : 'border-2 border-gray-300'
                        }`}
                      >
                        <span
                          className={
                            index < currentStep
                              ? 'text-white'
                              : index === currentStep
                              ? 'text-indigo-600'
                              : 'text-gray-500'
                          }
                        >
                          {index + 1}
                        </span>
                      </span>
                      <span
                        className={`ml-4 text-sm font-medium ${
                          index < currentStep
                            ? 'text-indigo-600'
                            : index === currentStep
                            ? 'text-indigo-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </span>
                    </span>
                  </button>

                  {index !== filteredSteps.length - 1 && (
                    <div
                      className="absolute right-0 top-0 hidden h-full w-5 md:block"
                      aria-hidden="true"
                    >
                      <svg
                        className="h-full w-full text-gray-300"
                        viewBox="0 0 22 80"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0 -2L20 40L0 82"
                          vectorEffect="non-scaling-stroke"
                          stroke="currentcolor"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Form */}
          <div className="rounded-lg bg-white p-8 shadow">
            {renderStep()}

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error creating seller
                    </h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={isLastStep ? handleSubmit : handleNext}
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : isLastStep ? (
                  'Submit'
                ) : (
                  'Next'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 