'use client';

import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
}

interface ProductDetailsData {
  categories: string[];
  tags: string[];
}

interface ProductDetailsStepProps {
  data: ProductDetailsData;
  onChange: (data: ProductDetailsData) => void;
}

export default function ProductDetailsStep({
  data,
  onChange
}: ProductDetailsStepProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        // Initialize with some default categories until the database is set up
        const defaultCategories = [
          { id: '1', name: 'Electronics' },
          { id: '2', name: 'Fashion' },
          { id: '3', name: 'Home & Living' },
          { id: '4', name: 'Books' },
          { id: '5', name: 'Sports & Fitness' }
        ];
        setCategories(data.length > 0 ? data : defaultCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Use default categories on error
        setCategories([
          { id: '1', name: 'Electronics' },
          { id: '2', name: 'Fashion' },
          { id: '3', name: 'Home & Living' },
          { id: '4', name: 'Books' },
          { id: '5', name: 'Sports & Fitness' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = data.categories.includes(categoryId)
      ? data.categories.filter((id) => id !== categoryId)
      : [...data.categories, categoryId];

    onChange({
      ...data,
      categories: newCategories
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !data.tags.includes(newTag.trim())) {
      onChange({
        ...data,
        tags: [...data.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange({
      ...data,
      tags: data.tags.filter((t) => t !== tag)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Product Details</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select product categories and add relevant tags.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Business Categories
          </label>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categories.map((category) => (
              <div key={category.id} className="relative flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={data.categories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor={`category-${category.id}`}
                    className="font-medium text-gray-700"
                  >
                    {category.name}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Product Tags
          </label>
          <div className="mt-2">
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-indigo-100 py-1 pl-2.5 pr-1 text-sm font-medium text-indigo-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                >
                  <span className="sr-only">Remove {tag}</span>
                  <svg
                    className="h-2 w-2"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 8 8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      d="M1 1l6 6m0-6L1 7"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 