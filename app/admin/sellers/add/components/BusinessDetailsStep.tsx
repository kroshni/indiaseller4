interface BusinessDetailsData {
  companyName: string;
  gstin: string;
  pan: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

interface BusinessDetailsStepProps {
  data: BusinessDetailsData;
  onChange: (data: BusinessDetailsData) => void;
}

export default function BusinessDetailsStep({
  data,
  onChange
}: BusinessDetailsStepProps) {
  const handleChange = (field: keyof BusinessDetailsData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Business Details</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please provide your business information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label
            htmlFor="company-name"
            className="block text-sm font-medium text-gray-700"
          >
            Company Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="company-name"
              id="company-name"
              value={data.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="gstin"
            className="block text-sm font-medium text-gray-700"
          >
            GSTIN
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="gstin"
              id="gstin"
              value={data.gstin}
              onChange={(e) => handleChange('gstin', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
              title="Please enter a valid GSTIN"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Format: 22AAAAA0000A1Z5
          </p>
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="pan"
            className="block text-sm font-medium text-gray-700"
          >
            PAN
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="pan"
              id="pan"
              value={data.pan}
              onChange={(e) => handleChange('pan', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
              title="Please enter a valid PAN"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Format: AAAAA0000A
          </p>
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="bank-name"
            className="block text-sm font-medium text-gray-700"
          >
            Bank Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="bank-name"
              id="bank-name"
              value={data.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="account-number"
            className="block text-sm font-medium text-gray-700"
          >
            Account Number
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="account-number"
              id="account-number"
              value={data.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              pattern="[0-9]{9,18}"
              title="Please enter a valid account number (9-18 digits)"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="ifsc-code"
            className="block text-sm font-medium text-gray-700"
          >
            IFSC Code
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="ifsc-code"
              id="ifsc-code"
              value={data.ifscCode}
              onChange={(e) => handleChange('ifscCode', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
              title="Please enter a valid IFSC code"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Format: ABCD0123456
          </p>
        </div>
      </div>
    </div>
  );
} 