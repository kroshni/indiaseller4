interface PersonalDetailsData {
  name: string;
  email: string;
  phone: string;
  profilePictureUrl: string;
  password: string;
}

interface PersonalDetailsStepProps {
  data: PersonalDetailsData;
  onChange: (data: PersonalDetailsData) => void;
}

export default function PersonalDetailsStep({
  data,
  onChange
}: PersonalDetailsStepProps) {
  const handleChange = (field: keyof PersonalDetailsData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Personal Details</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please provide your personal information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <div className="mt-1">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label
            htmlFor="profile-picture"
            className="block text-sm font-medium text-gray-700"
          >
            Profile Picture URL
          </label>
          <div className="mt-1">
            <input
              type="url"
              name="profile-picture"
              id="profile-picture"
              value={data.profilePictureUrl}
              onChange={(e) => handleChange('profilePictureUrl', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {data.profilePictureUrl && (
            <div className="mt-2">
              <img
                src={data.profilePictureUrl}
                alt="Profile Preview"
                className="h-32 w-32 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128';
                }}
              />
            </div>
          )}
        </div>

        <div className="sm:col-span-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              type="password"
              name="password"
              id="password"
              value={data.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Password must be at least 8 characters long and contain at least one
            uppercase letter, one lowercase letter, one number, and one special
            character.
          </p>
        </div>
      </div>
    </div>
  );
} 