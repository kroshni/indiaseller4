interface SellerTypeData {
  isProductSeller: boolean;
  isServiceSeller: boolean;
}

interface SellerTypeStepProps {
  data: SellerTypeData;
  onChange: (data: SellerTypeData) => void;
}

export default function SellerTypeStep({ data, onChange }: SellerTypeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Select Seller Type</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose the type of seller you want to register. You can select both options if applicable.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="product-seller"
              name="product-seller"
              type="checkbox"
              checked={data.isProductSeller}
              onChange={(e) =>
                onChange({
                  ...data,
                  isProductSeller: e.target.checked
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="product-seller" className="font-medium text-gray-700">
              Product-Based Seller
            </label>
            <p className="text-gray-500">
              Select this if you want to sell physical products through our platform.
            </p>
          </div>
        </div>

        <div className="relative flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="service-seller"
              name="service-seller"
              type="checkbox"
              checked={data.isServiceSeller}
              onChange={(e) =>
                onChange({
                  ...data,
                  isServiceSeller: e.target.checked
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="service-seller" className="font-medium text-gray-700">
              Service-Based Seller
            </label>
            <p className="text-gray-500">
              Select this if you want to offer services through our platform.
            </p>
          </div>
        </div>
      </div>

      {!data.isProductSeller && !data.isServiceSeller && (
        <div className="mt-4 text-sm text-red-600">
          Please select at least one seller type to continue.
        </div>
      )}
    </div>
  );
} 