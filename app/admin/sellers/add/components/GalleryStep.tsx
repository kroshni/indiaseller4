'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface GalleryImage {
  imageId: string;
  imageUrl: string;
  caption: string;
}

interface GalleryStepProps {
  data: GalleryImage[];
  onChange: (data: GalleryImage[]) => void;
}

export default function GalleryStep({ data, onChange }: GalleryStepProps) {
  const [newImage, setNewImage] = useState<GalleryImage>({
    imageId: uuidv4(),
    imageUrl: '',
    caption: ''
  });

  const handleAddImage = () => {
    if (newImage.imageUrl) {
      onChange([...data, { ...newImage }]);
      setNewImage({
        imageId: uuidv4(),
        imageUrl: '',
        caption: ''
      });
    }
  };

  const handleRemoveImage = (imageId: string) => {
    onChange(data.filter((img) => img.imageId !== imageId));
  };

  const handleUpdateCaption = (imageId: string, caption: string) => {
    onChange(
      data.map((img) =>
        img.imageId === imageId ? { ...img, caption } : img
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Gallery Images</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add images showcasing your business, products, or services.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="image-url"
              className="block text-sm font-medium text-gray-700"
            >
              Image URL
            </label>
            <div className="mt-1">
              <input
                type="url"
                id="image-url"
                value={newImage.imageUrl}
                onChange={(e) =>
                  setNewImage({ ...newImage, imageUrl: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="https://"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="caption"
              className="block text-sm font-medium text-gray-700"
            >
              Caption
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="caption"
                value={newImage.caption}
                onChange={(e) =>
                  setNewImage({ ...newImage, caption: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <button
              type="button"
              onClick={handleAddImage}
              disabled={!newImage.imageUrl}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Add Image
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((image) => (
            <div
              key={image.imageId}
              className="group relative rounded-lg border border-gray-200 p-4"
            >
              <div className="aspect-w-4 aspect-h-3">
                <img
                  src={image.imageUrl}
                  alt={image.caption}
                  className="h-full w-full rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              </div>
              <div className="mt-2">
                <input
                  type="text"
                  value={image.caption}
                  onChange={(e) =>
                    handleUpdateCaption(image.imageId, e.target.value)
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add a caption"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(image.imageId)}
                className="absolute -right-2 -top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <span className="sr-only">Remove image</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <p className="text-sm text-gray-500">No images added yet.</p>
        )}
      </div>
    </div>
  );
} 