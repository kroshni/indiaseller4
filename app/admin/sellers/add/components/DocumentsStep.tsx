'use client';

import { useState } from 'react';

interface Document {
  documentType: string;
  documentUrl: string;
}

interface DocumentsStepProps {
  data: Document[];
  onChange: (data: Document[]) => void;
}

const DOCUMENT_TYPES = [
  'Business Registration',
  'Tax Certificate',
  'Trade License',
  'Insurance Certificate',
  'Professional License',
  'Other'
];

export default function DocumentsStep({ data, onChange }: DocumentsStepProps) {
  const [newDocument, setNewDocument] = useState({
    documentType: '',
    documentUrl: ''
  });

  const handleAddDocument = () => {
    if (newDocument.documentType && newDocument.documentUrl) {
      onChange([...data, { ...newDocument }]);
      setNewDocument({ documentType: '', documentUrl: '' });
    }
  };

  const handleRemoveDocument = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Business Documents</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload your business-related documents.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="document-type"
                className="block text-sm font-medium text-gray-700"
              >
                Document Type
              </label>
              <select
                id="document-type"
                value={newDocument.documentType}
                onChange={(e) =>
                  setNewDocument({
                    ...newDocument,
                    documentType: e.target.value
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select document type</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label
                htmlFor="document-url"
                className="block text-sm font-medium text-gray-700"
              >
                Document URL
              </label>
              <input
                type="url"
                id="document-url"
                value={newDocument.documentUrl}
                onChange={(e) =>
                  setNewDocument({
                    ...newDocument,
                    documentUrl: e.target.value
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="https://"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddDocument}
                disabled={!newDocument.documentType || !newDocument.documentUrl}
                className="mb-[1px] inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Add Document
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {data.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {doc.documentType}
                </h4>
                <p className="mt-1 text-sm text-gray-500">{doc.documentUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDocument(index)}
                className="ml-4 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <p className="text-sm text-gray-500">No documents added yet.</p>
        )}
      </div>
    </div>
  );
} 